import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  orderId: string;
  salesmanId: string;
  salesmanName: string;
  shopOwnerName?: string;
  shopOwnerArea?: string;
  shopRoute?: string;
  customerId?: string;
  customerName: string;
  customerClassification: 'NORMAL' | 'DAMAGE' | 'EXPIRY';
  customerMobile?: string;
  customerEmail?: string;
  customerGstin?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  items: any[];
  expiredItems?: any[];
  returnItems?: any[];
  hasUrgentItems?: boolean;
  hasExpiredItems?: boolean;
  hasReturnItems?: boolean;
  paymentMethod?: string;
  subtotal: number;
  tax: number;
  grandTotal: number;
  paymentStatus: 'OFFLINE';
  collectionStatus: 'PENDING' | 'COLLECTED';
  isRead: boolean;
  readAt?: Date;
  readBy?: string;
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
    shopOwnerName: { type: String, default: '' },
    shopOwnerArea: { type: String, default: '' },
    shopRoute: { type: String, default: '' },
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerClassification: { type: String, enum: ['NORMAL', 'DAMAGE', 'EXPIRY'], default: 'NORMAL' },
    customerMobile: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    customerGstin: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    customerCity: { type: String, default: 'Kanpur' },
    customerState: { type: String, default: 'Uttar Pradesh' },
    items: { type: Array, required: true },
    expiredItems: { type: Array, default: [] },
    returnItems: { type: Array, default: [] },
    hasUrgentItems: { type: Boolean, default: false, index: true },
    hasExpiredItems: { type: Boolean, default: false },
    hasReturnItems: { type: Boolean, default: false },
    paymentMethod: { type: String, default: 'Cash' },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['OFFLINE'], default: 'OFFLINE' },
    collectionStatus: { type: String, enum: ['PENDING', 'COLLECTED'], default: 'PENDING' },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    readBy: { type: String, default: '' },
    issuedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

InvoiceSchema.index({ salesmanId: 1, issuedAt: -1 });
InvoiceSchema.index({ customerId: 1, issuedAt: -1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

