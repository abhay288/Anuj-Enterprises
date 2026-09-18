import { Invoice } from '../models/Invoice.js';
import { parsePagination, escapeRegex } from '../utils/securityUtils.js';
export const getInvoices = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const { salesmanId, search, status } = req.query;
        const filter = {};
        // Role-based Access Control Scope (Requirement 1)
        if (req.user.role === 'SALESMAN') {
            // Salesman can only access invoices belonging to their authorized salesman ID
            const userSalesmanId = req.user.salesmanId || req.user.id;
            filter.salesmanId = String(userSalesmanId).toUpperCase();
        }
        else if (req.user.role === 'USER') {
            // Normal user can only access their own invoices
            filter.$or = [
                { customerId: req.user.id },
                { customerMobile: req.user.email }
            ];
        }
        else if (req.user.role === 'ADMIN') {
            // Admin can view all or filter by specific salesman
            if (salesmanId) {
                filter.salesmanId = String(salesmanId).toUpperCase();
            }
        }
        else {
            return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
        }
        if (status) {
            filter.status = status;
        }
        if (search) {
            const escaped = escapeRegex(String(search).trim());
            const searchRegex = new RegExp(escaped, 'i');
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { invoiceNumber: searchRegex },
                    { orderId: searchRegex },
                    { customerName: searchRegex }
                ]
            });
        }
        const { limit, skip, page } = parsePagination(req.query, 50, 100);
        const [invoices, totalCount] = await Promise.all([
            Invoice.find(filter).sort({ issuedAt: -1 }).skip(skip).limit(limit).lean(),
            Invoice.countDocuments(filter)
        ]);
        return res.json({
            success: true,
            data: {
                invoices,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    pages: Math.ceil(totalCount / limit)
                }
            },
            message: 'Invoices retrieved successfully'
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getInvoiceById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const idStr = String(req.params.id);
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const invoice = await Invoice.findOne({
            $or: [{ invoiceNumber: idStr }, { orderId: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        // IDOR Verification (Requirement 1): Verify caller has authorization to view this invoice
        if (req.user.role === 'SALESMAN') {
            const userSalesmanId = String(req.user.salesmanId || req.user.id).toUpperCase();
            if (String(invoice.salesmanId).toUpperCase() !== userSalesmanId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: You do not have authorization to view this invoice.',
                    code: 'FORBIDDEN'
                });
            }
        }
        else if (req.user.role === 'USER') {
            if (invoice.customerId !== req.user.id && invoice.customerMobile !== req.user.email) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: You do not have permission to view this invoice.',
                    code: 'FORBIDDEN'
                });
            }
        }
        return res.json({ success: true, data: { invoice } });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getInvoicePdf = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const idStr = String(req.params.id);
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const invoice = await Invoice.findOne({
            $or: [{ invoiceNumber: idStr }, { orderId: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!invoice)
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        // IDOR Verification
        if (req.user.role === 'SALESMAN') {
            const userSalesmanId = String(req.user.salesmanId || req.user.id).toUpperCase();
            if (String(invoice.salesmanId).toUpperCase() !== userSalesmanId) {
                return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
            }
        }
        else if (req.user.role === 'USER') {
            if (invoice.customerId !== req.user.id && invoice.customerMobile !== req.user.email) {
                return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
            }
        }
        return res.json({
            success: true,
            data: {
                pdfUrl: `/api/v1/invoices/${invoice.invoiceNumber}`,
                invoiceNumber: invoice.invoiceNumber
            },
            message: 'PDF stream ready for print'
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
