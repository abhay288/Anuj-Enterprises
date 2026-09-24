import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  ownerName?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  area?: string;
  gstin?: string;
  classification: 'NORMAL' | 'DAMAGE' | 'EXPIRY';
  adminTag?: 'No Tag' | 'Lazy' | 'Super Lazy' | 'Best Customer';
  customerMode: 'QUICK' | 'FULL';
  createdBy?: string;
  assignedSalesmanId?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, default: '' },
    phone: { type: String, default: '' },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    area: { type: String, default: '' },
    gstin: { type: String, default: '' },
    classification: { type: String, enum: ['NORMAL', 'DAMAGE', 'EXPIRY'], default: 'NORMAL' },
    adminTag: { type: String, enum: ['No Tag', 'Lazy', 'Super Lazy', 'Best Customer'], default: 'No Tag' },
    customerMode: { type: String, enum: ['QUICK', 'FULL'], default: 'QUICK' },
    createdBy: { type: String, default: 'SALESMAN' },
    assignedSalesmanId: { type: String, default: '' },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date }
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
