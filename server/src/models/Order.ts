import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  sku: string;
  productName: string;
  companyName: string;
  categoryName: string;
  quantity: number;
  price: number;
  packSize?: string;
  bundleSize?: string;
  caseSize?: string;
  total: number;
}

export interface IOrder extends Document {
  orderId: string;
  invoiceNumber?: string;
  salesmanId: string;
  salesmanName: string;
  customerId?: string;
  customerName: string;
  customerClassification: 'NORMAL' | 'DAMAGE' | 'EXPIRY';
  customerDetails?: {
    mobile?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    gstin?: string;
  };
  items: IOrderItem[];
  totalQuantity: number;
  totalAmount: number;
  orderType: 'OFFLINE_COLLECTION';
  paymentStatus: 'OFFLINE';
  collectionStatus: 'PENDING' | 'COLLECTED';
  status: 'NEW' | 'CONFIRMED' | 'READY_FOR_COLLECTION' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    sku: { type: String, required: true },
    productName: { type: String, required: true },
    companyName: { type: String, default: '' },
    categoryName: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    packSize: { type: String, default: '1 Unit' },
    bundleSize: { type: String, default: '' },
    caseSize: { type: String, default: '' },
    total: { type: Number, required: true }
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, index: true },
    salesmanId: { type: String, required: true, index: true },
    salesmanName: { type: String, required: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerClassification: { type: String, enum: ['NORMAL', 'DAMAGE', 'EXPIRY'], default: 'NORMAL' },
    customerDetails: {
      mobile: String,
      email: String,
      address: String,
      city: String,
      state: String,
      gstin: String
    },
    items: [OrderItemSchema],
    totalQuantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    orderType: { type: String, enum: ['OFFLINE_COLLECTION'], default: 'OFFLINE_COLLECTION' },
    paymentStatus: { type: String, enum: ['OFFLINE'], default: 'OFFLINE' },
    collectionStatus: { type: String, enum: ['PENDING', 'COLLECTED'], default: 'PENDING' },
    status: { 
      type: String, 
      enum: ['NEW', 'CONFIRMED', 'READY_FOR_COLLECTION', 'COMPLETED', 'CANCELLED'], 
      default: 'NEW' 
    }
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
