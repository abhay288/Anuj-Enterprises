import { Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { parsePagination, escapeRegex } from '../utils/securityUtils.js';
import { sendOrderInvoiceEmail } from '../utils/emailService.js';

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    const { salesmanId, search, status } = req.query;
    const filter: any = {};

    // Role-based Access Control Scope (Requirement 1)
    if (req.user.role === 'SALESMAN') {
      // Salesman can only access invoices belonging to their authorized salesman ID
      const userSalesmanId = req.user.salesmanId || req.user.id;
      filter.salesmanId = String(userSalesmanId).toUpperCase();
    } else if (req.user.role === 'USER' || req.user.role === 'CUSTOMER') {
      // Normal customer can only access their own invoices
      filter.$or = [
        { customerId: req.user.customerId || req.user.id },
        { customerEmail: req.user.email },
        { customerMobile: req.user.mobile || req.user.email }
      ];
    } else if (req.user.role === 'ADMIN') {
      // Admin can view all or filter by specific salesman
      if (salesmanId) {
        filter.salesmanId = String(salesmanId).toUpperCase();
      }
    } else {
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
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
    } else if (req.user.role === 'USER') {
      if (invoice.customerId !== req.user.id && invoice.customerMobile !== req.user.email) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to view this invoice.',
          code: 'FORBIDDEN'
        });
      }
    }

    return res.json({ success: true, data: { invoice } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoicePdf = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const invoice = await Invoice.findOne({ 
      $or: [{ invoiceNumber: idStr }, { orderId: idStr }, { _id: isObjectId ? idStr : null }] 
    });

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    // IDOR Verification
    if (req.user.role === 'SALESMAN') {
      const userSalesmanId = String(req.user.salesmanId || req.user.id).toUpperCase();
      if (String(invoice.salesmanId).toUpperCase() !== userSalesmanId) {
        return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
      }
    } else if (req.user.role === 'USER') {
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleInvoiceRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const idStr = String(req.params.id);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
    const invoice = await Invoice.findOne({
      $or: [{ invoiceNumber: idStr }, { orderId: idStr }, { _id: isObjectId ? idStr : null }]
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const nowRead = !invoice.isRead;
    invoice.isRead = nowRead;
    invoice.readAt = nowRead ? new Date() : undefined;
    invoice.readBy = nowRead ? (req.user.name || req.user.id || 'Admin') : '';
    await invoice.save();

    return res.json({
      success: true,
      data: { isRead: invoice.isRead, readAt: invoice.readAt, readBy: invoice.readBy },
      message: `Invoice marked as ${nowRead ? 'Read' : 'Unread'}`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const idStr = String(req.params.id);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
    const invoice = await Invoice.findOne({
      $or: [{ invoiceNumber: idStr }, { orderId: idStr }, { _id: isObjectId ? idStr : null }]
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    // Safely unlink invoice from the related order (don't delete the order)
    const { Order } = await import('../models/Order.js');
    await Order.updateOne(
      { $or: [{ orderId: invoice.orderId }, { invoiceNumber: invoice.invoiceNumber }] },
      { $set: { invoiceNumber: null } }
    );

    await Invoice.deleteOne({ _id: invoice._id });

    return res.json({ success: true, message: `Invoice ${invoice.invoiceNumber} deleted permanently` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendInvoiceEmail = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const idStr = String(req.params.id);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
    const invoice = await Invoice.findOne({
      $or: [{ invoiceNumber: idStr }, { orderId: idStr }, { _id: isObjectId ? idStr : null }]
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invAny = invoice as any;
    const { email, pdfBase64 } = req.body || {};
    const recipientEmail = email || invAny.customerEmail || invAny.email;
    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email address is required' });
    }

    let pdfAttachment: any = undefined;
    if (pdfBase64 && typeof pdfBase64 === 'string') {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      pdfAttachment = {
        filename: `Sales_Invoice_${invoice.invoiceNumber}.pdf`,
        content: Buffer.from(cleanBase64, 'base64'),
        contentType: 'application/pdf'
      };
    }

    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const totalQty = items.reduce((s: number, i: any) => s + (parseInt(i.quantity || i.qty || 1, 10)), 0);

    const orderData: any = {
      orderId: invoice.orderId || invoice.invoiceNumber,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      shopOwnerName: invoice.shopOwnerName,
      customerMobile: invoice.customerMobile,
      customerAddress: invoice.customerAddress,
      customerCity: invAny.customerCity || 'Kanpur',
      customerState: invAny.customerState || 'Uttar Pradesh',
      totalQuantity: totalQty || 1,
      totalAmount: invoice.grandTotal || invAny.totalAmount || invoice.subtotal || 0,
      items: items,
      date: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB')
    };

    const result = await sendOrderInvoiceEmail(orderData, recipientEmail, pdfAttachment);

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error || 'Failed to send invoice email via Nodemailer' });
    }

    return res.json({
      success: true,
      message: `Real B2B Invoice #${invoice.invoiceNumber} with PDF attachment sent successfully to ${recipientEmail} via Nodemailer!`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error sending invoice email' });
  }
};

export const toggleInvoiceUrgent = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
    const invoice = await Invoice.findOne({
      $or: [{ invoiceNumber: idStr }, { orderId: idStr }, { _id: isObjectId ? idStr : null }]
    });

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const newUrgent = req.body.isUrgent !== undefined ? Boolean(req.body.isUrgent) : !invoice.hasUrgentItems;
    invoice.hasUrgentItems = newUrgent;
    await invoice.save();

    // Synchronize urgent status with MongoDB Order document
    const { Order } = await import('../models/Order.js');
    await Order.updateOne(
      { $or: [{ orderId: invoice.orderId }, { invoiceNumber: invoice.invoiceNumber }] },
      { $set: { hasUrgentItems: newUrgent } }
    );

    return res.json({
      success: true,
      data: {
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        hasUrgentItems: newUrgent
      },
      message: `Invoice #${invoice.invoiceNumber} marked as ${newUrgent ? 'Urgent Priority' : 'Normal Priority'}`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



