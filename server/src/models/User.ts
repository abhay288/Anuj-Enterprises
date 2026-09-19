import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminDevice {
  deviceId: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  lastIP?: string;
  lastLocation?: string;
  lastLoginAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'USER' | 'CUSTOMER' | 'SALESMAN' | 'ADMIN';
  status: 'Active' | 'Disabled';
  avatar?: string;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  knownDevices?: IAdminDevice[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminDeviceSchema = new Schema(
  {
    deviceId: { type: String, required: true },
    browser: { type: String, default: '' },
    os: { type: String, default: '' },
    deviceType: { type: String, default: '' },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    lastIP: { type: String, default: '' },
    lastLocation: { type: String, default: '' },
    lastLoginAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
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
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

