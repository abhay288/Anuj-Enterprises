import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  classification: 'NORMAL' | 'DAMAGE' | 'EXPIRY';
  customerMode: 'QUICK' | 'FULL';
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    gstin: { type: String, default: '' },
    classification: { type: String, enum: ['NORMAL', 'DAMAGE', 'EXPIRY'], default: 'NORMAL' },
    customerMode: { type: String, enum: ['QUICK', 'FULL'], default: 'QUICK' },
    createdBy: { type: String, default: 'SALESMAN' }
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
