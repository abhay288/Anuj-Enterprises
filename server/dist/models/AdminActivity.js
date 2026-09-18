import mongoose, { Schema } from 'mongoose';
const AdminActivitySchema = new Schema({
    action: { type: String, required: true },
    adminId: { type: String, required: true },
    adminName: { type: String, default: 'Admin' },
    details: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });
export const AdminActivity = mongoose.model('AdminActivity', AdminActivitySchema);
