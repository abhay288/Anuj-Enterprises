import bcrypt from 'bcryptjs';
import { Salesman } from '../models/Salesman.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { parsePagination, escapeRegex } from '../utils/securityUtils.js';
export const getSalesmen = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        // Role-based Access Control Scope (Requirement 3)
        if (req.user.role === 'SALESMAN') {
            // Salesman can only view their own profile information
            const sId = String(req.user.salesmanId || '').toUpperCase();
            const uId = req.user.id;
            const isObjectId = uId && uId.match(/^[0-9a-fA-F]{24}$/);
            const ownProfile = await Salesman.findOne({
                $or: [
                    { salesmanId: sId },
                    { email: req.user.email?.toLowerCase() },
                    { _id: isObjectId ? uId : null }
                ]
            }).select('-passwordHash').lean();
            if (!ownProfile) {
                return res.status(404).json({ success: false, message: 'Salesman profile not found' });
            }
            return res.json({
                success: true,
                data: {
                    salesmen: [{
                            id: ownProfile.salesmanId,
                            _id: ownProfile._id,
                            name: ownProfile.name,
                            email: ownProfile.email,
                            phone: ownProfile.phone,
                            status: ownProfile.status,
                            region: ownProfile.region || 'HQ Hub',
                            salesVolume: ownProfile.totalPurchase || '0 Units',
                            ordersCount: ownProfile.totalOrders || 0,
                            lastOrder: ownProfile.lastOrderDate || 'None'
                        }]
                },
                message: 'Personal salesman profile retrieved'
            });
        }
        // ADMIN: View full roster with pagination and search
        if (req.user.role === 'ADMIN') {
            const { search, status } = req.query;
            const filter = {};
            if (status) {
                filter.status = status;
            }
            if (search) {
                const qEscaped = escapeRegex(String(search).trim());
                const regex = new RegExp(qEscaped, 'i');
                filter.$or = [
                    { name: regex },
                    { email: regex },
                    { phone: regex },
                    { salesmanId: regex },
                    { region: regex }
                ];
            }
            const { limit, skip, page } = parsePagination(req.query, 50, 100);
            const [salesmen, totalCount] = await Promise.all([
                Salesman.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                Salesman.countDocuments(filter)
            ]);
            const formatted = salesmen.map((s) => ({
                id: s.salesmanId,
                _id: s._id,
                name: s.name,
                email: s.email,
                phone: s.phone,
                status: s.status,
                region: s.region || 'West India (Mumbai HQ)',
                salesVolume: s.totalPurchase || '0 Units',
                ordersCount: s.totalOrders || 0,
                lastOrder: s.lastOrderDate || 'None'
            }));
            return res.json({
                success: true,
                data: {
                    salesmen: formatted,
                    pagination: {
                        total: totalCount,
                        page,
                        limit,
                        pages: Math.ceil(totalCount / limit)
                    }
                },
                message: 'Salesmen roster retrieved'
            });
        }
        return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getSalesmanById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const idStr = String(req.params.id);
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const salesman = await Salesman.findOne({
            $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }]
        }).select('-passwordHash');
        if (!salesman) {
            return res.status(404).json({ success: false, message: 'Salesman not found' });
        }
        // Role-based Access Control Scope (Requirement 3):
        if (req.user.role === 'SALESMAN') {
            const userSalesmanId = String(req.user.salesmanId || '').toUpperCase();
            const userDocId = String(req.user.id);
            if (salesman.salesmanId !== userSalesmanId && String(salesman._id) !== userDocId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: You do not have authorization to view other sales representatives.',
                    code: 'FORBIDDEN'
                });
            }
        }
        else if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
        }
        return res.json({ success: true, data: { salesman } });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const createSalesman = async (req, res) => {
    try {
        const { id, salesmanId, name, email, phone, region, password } = req.body || {};
        const finalId = (salesmanId || id || `AE-SM-00${Date.now().toString().slice(-2)}`).toUpperCase();
        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, message: 'Name, email, and phone are required' });
        }
        const existing = await Salesman.findOne({
            $or: [{ salesmanId: finalId }, { email: String(email).toLowerCase() }]
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Salesman with this ID or Email already exists' });
        }
        const initialPassword = password || 'Sales@123';
        const passwordHash = await bcrypt.hash(initialPassword, 10);
        const salesman = new Salesman({
            salesmanId: finalId,
            name,
            email: String(email).toLowerCase(),
            phone,
            passwordHash,
            region: region || 'Central UP (Kanpur HQ)',
            status: 'Active',
            totalOrders: 0,
            totalPurchase: '0 Units'
        });
        await salesman.save();
        await AdminActivity.create({
            action: 'SALESMAN_CREATED',
            adminId: req.user?.id || 'ADMIN',
            adminName: req.user?.name || 'Administrator',
            details: `Created new salesman ${name} with ID ${finalId}`
        });
        return res.status(201).json({
            success: true,
            data: {
                salesman: {
                    id: salesman.salesmanId,
                    name: salesman.name,
                    email: salesman.email,
                    phone: salesman.phone,
                    region: salesman.region,
                    status: salesman.status
                }
            },
            message: `Salesman ${name} created successfully`
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const updateSalesman = async (req, res) => {
    try {
        const idStr = String(req.params.id);
        const { name, email, phone, region } = req.body || {};
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const salesman = await Salesman.findOne({ $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }] });
        if (!salesman)
            return res.status(404).json({ success: false, message: 'Salesman not found' });
        if (name)
            salesman.name = name;
        if (email)
            salesman.email = String(email).toLowerCase();
        if (phone)
            salesman.phone = phone;
        if (region)
            salesman.region = region;
        await salesman.save();
        return res.json({ success: true, data: { salesman }, message: 'Salesman updated successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const toggleSalesmanStatus = async (req, res) => {
    try {
        const idStr = String(req.params.id);
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const salesman = await Salesman.findOne({ $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }] });
        if (!salesman)
            return res.status(404).json({ success: false, message: 'Salesman not found' });
        salesman.status = salesman.status === 'Active' ? 'Disabled' : 'Active';
        await salesman.save();
        await AdminActivity.create({
            action: 'SALESMAN_STATUS_TOGGLED',
            adminId: req.user?.id || 'ADMIN',
            adminName: req.user?.name || 'Administrator',
            details: `Salesman ${salesman.name} (${salesman.salesmanId}) status set to ${salesman.status}`
        });
        return res.json({
            success: true,
            data: { id: salesman.salesmanId, status: salesman.status },
            message: `Salesman status changed to ${salesman.status}`
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const resetPassword = async (req, res) => {
    try {
        const idStr = String(req.params.id);
        const { newPassword } = req.body || {};
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const salesman = await Salesman.findOne({ $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }] });
        if (!salesman)
            return res.status(404).json({ success: false, message: 'Salesman not found' });
        const passwordToSet = newPassword || 'Sales@123';
        salesman.passwordHash = await bcrypt.hash(passwordToSet, 10);
        await salesman.save();
        await AdminActivity.create({
            action: 'SALESMAN_PASSWORD_RESET',
            adminId: req.user?.id || 'ADMIN',
            adminName: req.user?.name || 'Administrator',
            details: `Reset password for salesman ${salesman.name} (${salesman.salesmanId})`
        });
        return res.json({
            success: true,
            message: `Password reset successfully for ${salesman.name}`
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteSalesman = async (req, res) => {
    try {
        const idStr = String(req.params.id);
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const salesman = await Salesman.findOneAndDelete({ $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }] });
        if (!salesman)
            return res.status(404).json({ success: false, message: 'Salesman not found' });
        await AdminActivity.create({
            action: 'SALESMAN_DELETED',
            adminId: req.user?.id || 'ADMIN',
            adminName: req.user?.name || 'Administrator',
            details: `Deleted salesman ${salesman.name} (${salesman.salesmanId})`
        });
        return res.json({ success: true, message: 'Salesman account removed from roster' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
