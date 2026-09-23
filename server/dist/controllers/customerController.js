import { Customer } from '../models/Customer.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { parsePagination, escapeRegex } from '../utils/securityUtils.js';
export const getCustomers = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const userRole = String(req.user.role || '').toUpperCase();
        const { search, salesmanId } = req.query;
        const filter = {};
        if (userRole === 'SALESMAN') {
            const userSalesmanId = String(req.user.salesmanId || '').toUpperCase();
            if (userSalesmanId) {
                filter.$or = [
                    { createdBy: userSalesmanId },
                    { assignedSalesmanId: userSalesmanId }
                ];
            }
        }
        else if (userRole === 'ADMIN') {
            if (salesmanId) {
                filter.$or = [
                    { createdBy: String(salesmanId).toUpperCase() },
                    { assignedSalesmanId: String(salesmanId).toUpperCase() }
                ];
            }
            // Auto-synchronize registered users from User collection into Customer directory
            try {
                const customerUsers = await User.find({
                    role: { $in: ['CUSTOMER', 'USER', 'customer', 'user'] }
                }).lean();
                if (customerUsers.length > 0) {
                    const existingCustomers = await Customer.find({}, 'email phone mobile customerId').lean();
                    const emailSet = new Set(existingCustomers.map(c => (c.email || '').toLowerCase().trim()).filter(Boolean));
                    const phoneSet = new Set(existingCustomers
                        .flatMap(c => [c.phone, c.mobile])
                        .filter(Boolean)
                        .map(p => String(p).replace(/\D/g, '').slice(-10))
                        .filter(p => p.length >= 10));
                    const toInsert = [];
                    let custCount = existingCustomers.length;
                    for (const u of customerUsers) {
                        const uEmail = (u.email || '').toLowerCase().trim();
                        const uDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
                        const hasEmail = uEmail && emailSet.has(uEmail);
                        const hasPhone = uDigits.length >= 10 && phoneSet.has(uDigits);
                        if (!hasEmail && !hasPhone) {
                            custCount++;
                            const newCustId = `AE-CUST-${String(custCount + 100).padStart(3, '0')}`;
                            toInsert.push({
                                customerId: newCustId,
                                name: u.name || 'Valued Retailer',
                                ownerName: u.name || 'Valued Retailer',
                                email: uEmail,
                                phone: u.phone || '',
                                mobile: u.phone || '',
                                address: '',
                                city: 'Kanpur',
                                state: 'Uttar Pradesh',
                                classification: 'NORMAL',
                                customerMode: 'QUICK',
                                createdBy: 'SELF_REGISTERED',
                                totalOrders: 0,
                                totalSpent: 0
                            });
                            if (uEmail)
                                emailSet.add(uEmail);
                            if (uDigits.length >= 10)
                                phoneSet.add(uDigits);
                        }
                    }
                    if (toInsert.length > 0) {
                        await Customer.insertMany(toInsert, { ordered: false }).catch(() => { });
                    }
                }
            }
            catch (syncErr) {
                console.warn('[customerController] Auto-sync users to customers error:', syncErr);
            }
        }
        else if (userRole === 'CUSTOMER' || userRole === 'USER') {
            filter.$or = [
                { customerId: req.user.customerId },
                { phone: req.user.email || req.user.mobile },
                { email: req.user.email }
            ];
        }
        else {
            return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
        }
        if (search) {
            const qEscaped = escapeRegex(String(search).trim());
            const regex = new RegExp(qEscaped, 'i');
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { name: regex },
                    { ownerName: regex },
                    { phone: regex },
                    { mobile: regex },
                    { email: regex },
                    { customerId: regex },
                    { city: regex },
                    { state: regex }
                ]
            });
        }
        const defaultLimit = userRole === 'ADMIN' ? 1000 : 50;
        const maxLimit = userRole === 'ADMIN' ? 1000 : 100;
        const { limit, skip, page } = parsePagination(req.query, defaultLimit, maxLimit);
        const [customers, totalCount] = await Promise.all([
            Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Customer.countDocuments(filter)
        ]);
        return res.json({
            success: true,
            data: {
                customers,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    pages: Math.ceil(totalCount / limit)
                }
            },
            message: 'Customers retrieved successfully'
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getCustomerById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const idStr = String(req.params.id);
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const customer = await Customer.findOne({
            $or: [{ customerId: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!customer)
            return res.status(404).json({ success: false, message: 'Customer not found' });
        // IDOR Check for Salesman
        if (req.user.role === 'SALESMAN') {
            const userSalesmanId = String(req.user.salesmanId || '').toUpperCase();
            if (customer.createdBy && customer.createdBy !== userSalesmanId && customer.assignedSalesmanId !== userSalesmanId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: You do not have authorization to view this customer.',
                    code: 'FORBIDDEN'
                });
            }
        }
        else if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
        }
        return res.json({ success: true, data: { customer } });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getCustomerOrderHistory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const idStr = String(req.params.id);
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const customer = await Customer.findOne({
            $or: [{ customerId: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        // RBAC check: Salesman can only view history of authorized customer
        if (req.user.role === 'SALESMAN') {
            const userSalesmanId = String(req.user.salesmanId || '').toUpperCase();
            if (customer.createdBy && customer.createdBy !== userSalesmanId && customer.assignedSalesmanId !== userSalesmanId) {
                return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized access to customer data', code: 'FORBIDDEN' });
            }
        }
        else if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
        }
        const orders = await Order.find({
            $or: [{ customerId: customer.customerId }, { customerName: customer.name }]
        }).sort({ createdAt: -1 }).limit(100).lean();
        // Aggregate frequently ordered products
        const productFrequencyMap = {};
        for (const order of orders) {
            for (const item of order.items) {
                const key = item.sku || item.productId;
                if (!productFrequencyMap[key]) {
                    productFrequencyMap[key] = {
                        name: item.productName,
                        sku: item.sku,
                        totalQty: 0,
                        orderCount: 0
                    };
                }
                productFrequencyMap[key].totalQty += item.quantity;
                productFrequencyMap[key].orderCount += 1;
            }
        }
        const frequentlyOrdered = Object.values(productFrequencyMap).sort((a, b) => b.totalQty - a.totalQty).slice(0, 5);
        return res.json({
            success: true,
            data: {
                customer,
                orders,
                totalOrders: orders.length,
                lastOrderDate: orders.length > 0 ? new Date(orders[0].createdAt).toISOString().split('T')[0] : null,
                frequentlyOrdered
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address, city, state, classification } = req.body || {};
        if (!name || !phone) {
            return res.status(400).json({ success: false, message: 'Name and phone are required' });
        }
        const existing = await Customer.findOne({ phone: String(phone).trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Customer with this phone number already exists' });
        }
        const custCount = await Customer.countDocuments();
        const customer = new Customer({
            customerId: `AE-CUST-${String(custCount + 101).padStart(3, '0')}`,
            name: String(name).trim(),
            ownerName: String(req.body.ownerName || name).trim(),
            phone: String(phone).trim(),
            mobile: String(phone).trim(),
            email: email ? String(email).trim().toLowerCase() : '',
            address: address || '',
            city: city || 'Kanpur',
            state: state || 'Uttar Pradesh',
            classification: classification || 'NORMAL',
            customerMode: 'QUICK',
            createdBy: req.user?.salesmanId || req.user?.id || 'ADMIN',
            totalOrders: 0,
            totalSpent: 0
        });
        await customer.save();
        return res.status(201).json({
            success: true,
            data: { customer },
            message: 'Customer registered successfully'
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const updateCustomer = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const idStr = String(req.params.id);
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const customer = await Customer.findOne({
            $or: [{ customerId: idStr }, { _id: isObjectId ? idStr : null }, { phone: idStr }]
        });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        // Role check
        if (req.user.role === 'SALESMAN') {
            const userSalesmanId = String(req.user.salesmanId || '').toUpperCase();
            if (customer.createdBy && customer.createdBy !== userSalesmanId && customer.assignedSalesmanId !== userSalesmanId) {
                return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized', code: 'FORBIDDEN' });
            }
        }
        else if (req.user.role === 'CUSTOMER' || req.user.role === 'USER') {
            if (customer.customerId !== req.user.customerId && customer.email !== req.user.email && customer.phone !== (req.user.mobile || req.user.email)) {
                return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized', code: 'FORBIDDEN' });
            }
        }
        else if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
        }
        const { name, phone, email, address, city, state, area, classification } = req.body || {};
        if (name)
            customer.name = String(name).trim();
        if (phone)
            customer.phone = String(phone).trim();
        if (email !== undefined)
            customer.email = String(email).trim().toLowerCase();
        if (address !== undefined)
            customer.address = address;
        if (city !== undefined)
            customer.city = city;
        if (state !== undefined)
            customer.state = state;
        if (area !== undefined)
            customer.area = area;
        if (classification && req.user.role === 'ADMIN')
            customer.classification = classification;
        await customer.save();
        return res.json({
            success: true,
            data: { customer },
            message: 'Customer updated successfully'
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteCustomer = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admin access required', code: 'FORBIDDEN' });
        }
        const idStr = String(req.params.id);
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const customer = await Customer.findOneAndDelete({
            $or: [{ customerId: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        // Also delete any corresponding user authentication credentials
        if (customer.email || customer.phone || customer.mobile) {
            await User.deleteMany({
                $or: [
                    ...(customer.email ? [{ email: customer.email.toLowerCase() }] : []),
                    ...(customer.phone ? [{ phone: customer.phone }] : []),
                    ...(customer.mobile ? [{ phone: customer.mobile }] : [])
                ]
            }).catch(() => { });
        }
        return res.json({
            success: true,
            data: { customerId: customer.customerId },
            message: `Customer "${customer.name}" permanently deleted`
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
