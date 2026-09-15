import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  logo?: string;
  description?: string;
  status: 'Active' | 'Disabled';
  featured: boolean;
  isNew: boolean;
  rank?: number;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' },
    featured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    rank: { type: Number, default: 999, index: true },
    country: { type: String, default: 'India' }
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
