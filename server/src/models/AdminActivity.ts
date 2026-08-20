import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminActivity extends Document {
  action: string;
  adminId: string;
  adminName: string;
  details: string;
  createdAt: Date;
}

const AdminActivitySchema: Schema = new Schema(
  {
    action: { type: String, required: true },
    adminId: { type: String, required: true },
    adminName: { type: String, default: 'Admin' },
    details: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AdminActivity = mongoose.model<IAdminActivity>('AdminActivity', AdminActivitySchema);
