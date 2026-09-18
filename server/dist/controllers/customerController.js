import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { parsePagination, escapeRegex } from '../utils/securityUtils.js';
export const getCustomers = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const { search, salesmanId } = req.query;
        const filter = {};
        // Role-based Access Control Scope (Requirement 4)
        if (req.user.role === 'SALESMAN') {
            const userSalesmanId = String(req.user.salesmanId || '').toUpperCase();
            if (userSalesmanId) {
                filter.$or = [
                    { createdBy: userSalesmanId },
                    { assignedSalesmanId: userSalesmanId }
                ];
            }
        }
        else if (req.user.role === 'ADMIN') {
            if (salesmanId) {
                filter.$or = [
                    { createdBy: String(salesmanId).toUpperCase() },
                    { assignedSalesmanId: String(salesmanId).toUpperCase() }
                ];
            }
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
                    { phone: regex },
                    { customerId: regex },
                    { city: regex },
                    { state: regex }
                ]
            });
        }
        const { limit, skip, page } = parsePagination(req.query, 50, 100);
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
            phone: String(phone).trim(),
            email: email ? String(email).trim().toLowerCase() : '',
            address: address || '',
            city: city || 'Kanpur',
            state: state || 'Uttar Pradesh',
            classification: classification || 'NORMAL',
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
