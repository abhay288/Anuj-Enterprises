import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  orderId: string;
  salesmanId: string;
  salesmanName: string;
  customerId?: string;
  customerName: string;
  customerClassification: 'NORMAL' | 'DAMAGE' | 'EXPIRY';
  customerMobile?: string;
  customerGstin?: string;
  customerAddress?: string;
  items: any[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  paymentStatus: 'OFFLINE';
  collectionStatus: 'PENDING' | 'COLLECTED';
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    salesmanId: { type: String, required: true, index: true },
    salesmanName: { type: String, required: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerClassification: { type: String, enum: ['NORMAL', 'DAMAGE', 'EXPIRY'], default: 'NORMAL' },
    customerMobile: { type: String, default: '' },
    customerGstin: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    items: { type: Array, required: true },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['OFFLINE'], default: 'OFFLINE' },
    collectionStatus: { type: String, enum: ['PENDING', 'COLLECTED'], default: 'PENDING' },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
