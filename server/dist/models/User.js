import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['USER', 'CUSTOMER', 'SALESMAN', 'ADMIN'], default: 'USER' },
    status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' },
    avatar: { type: String, default: '' },
    lastLogin: { type: Date }
}, { timestamps: true });
export const User = mongoose.model('User', UserSchema);
