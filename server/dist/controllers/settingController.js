import { Setting } from '../models/Setting.js';
import { Order } from '../models/Order.js';
import { Invoice } from '../models/Invoice.js';
const VALID_RETENTION_DAYS = [0, 7, 15, 30, 60, 90, 180, 365];
export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.find().lean();
        const settingMap = {};
        for (const s of settings) {
            settingMap[s.key] = s.value;
        }
        // Return defaults if not set
        return res.json({
            success: true,
            data: {
                orderRetentionDays: settingMap['orderRetentionDays'] ?? 0,
                invoiceRetentionDays: settingMap['invoiceRetentionDays'] ?? 0
            },
            message: 'Settings fetched successfully'
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const updateRetentionSettings = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const { orderRetentionDays, invoiceRetentionDays } = req.body || {};
        const results = {};
        if (orderRetentionDays !== undefined) {
            const days = parseInt(String(orderRetentionDays), 10);
            if (!VALID_RETENTION_DAYS.includes(days)) {
                return res.status(400).json({ success: false, message: `Invalid orderRetentionDays. Must be one of: ${VALID_RETENTION_DAYS.join(', ')}` });
            }
            await Setting.findOneAndUpdate({ key: 'orderRetentionDays' }, { key: 'orderRetentionDays', value: days }, { upsert: true, new: true });
            results.orderRetentionDays = days;
        }
        if (invoiceRetentionDays !== undefined) {
            const days = parseInt(String(invoiceRetentionDays), 10);
            if (!VALID_RETENTION_DAYS.includes(days)) {
                return res.status(400).json({ success: false, message: `Invalid invoiceRetentionDays. Must be one of: ${VALID_RETENTION_DAYS.join(', ')}` });
            }
            await Setting.findOneAndUpdate({ key: 'invoiceRetentionDays' }, { key: 'invoiceRetentionDays', value: days }, { upsert: true, new: true });
            results.invoiceRetentionDays = days;
        }
        return res.json({ success: true, data: results, message: 'Retention settings saved successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const runAutoCleanup = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const orderSetting = await Setting.findOne({ key: 'orderRetentionDays' });
        const invoiceSetting = await Setting.findOne({ key: 'invoiceRetentionDays' });
        const orderDays = orderSetting?.value ?? 0;
        const invoiceDays = invoiceSetting?.value ?? 0;
        let deletedOrders = 0;
        let deletedInvoices = 0;
        if (orderDays > 0) {
            const cutoff = new Date(Date.now() - orderDays * 24 * 60 * 60 * 1000);
            const result = await Order.deleteMany({ createdAt: { $lt: cutoff } });
            deletedOrders = result.deletedCount || 0;
        }
        if (invoiceDays > 0) {
            const cutoff = new Date(Date.now() - invoiceDays * 24 * 60 * 60 * 1000);
            const result = await Invoice.deleteMany({ issuedAt: { $lt: cutoff } });
            deletedInvoices = result.deletedCount || 0;
        }
        return res.json({
            success: true,
            data: { deletedOrders, deletedInvoices },
            message: `Auto-cleanup complete. Deleted ${deletedOrders} orders and ${deletedInvoices} invoices.`
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
