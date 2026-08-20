import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesman extends Document {
  salesmanId: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  status: 'Active' | 'Disabled';
  avatar?: string;
  region?: string;
  totalOrders: number;
  totalPurchase: string;
  lastOrderDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SalesmanSchema: Schema = new Schema(
  {
    salesmanId: { type: String, required: true, unique: true, index: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' },
    avatar: { type: String, default: '' },
    region: { type: String, default: 'West India (Mumbai HQ)' },
    totalOrders: { type: Number, default: 0 },
    totalPurchase: { type: String, default: '0 Units' },
    lastOrderDate: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Salesman = mongoose.model<ISalesman>('Salesman', SalesmanSchema);
