import mongoose, { Schema } from 'mongoose';
const AdminDeviceSchema = new Schema({
    deviceId: { type: String, required: true },
    browser: { type: String, default: '' },
    os: { type: String, default: '' },
    deviceType: { type: String, default: '' },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    lastIP: { type: String, default: '' },
    lastLocation: { type: String, default: '' },
    lastLoginAt: { type: Date, default: Date.now }
}, { _id: false });
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['USER', 'CUSTOMER', 'SALESMAN', 'ADMIN'], default: 'USER' },
    status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' },
    avatar: { type: String, default: '' },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date, default: Date.now },
    knownDevices: [AdminDeviceSchema]
}, { timestamps: true });
export const User = mongoose.model('User', UserSchema);
