import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find().sort({ issuedAt: -1 }).lean();
    return res.json({
      success: true,
      data: { invoices },
      message: 'Invoices retrieved'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const invoice = await Invoice.findOne({ $or: [{ invoiceNumber: idStr }, { orderId: idStr }, { _id: isObjectId ? idStr : null }] });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    return res.json({ success: true, data: { invoice } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoicePdf = async (req: Request, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const invoice = await Invoice.findOne({ $or: [{ invoiceNumber: idStr }, { orderId: idStr }] });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

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
