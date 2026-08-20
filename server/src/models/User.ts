import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'USER' | 'SALESMAN' | 'ADMIN';
  status: 'Active' | 'Disabled';
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['USER', 'SALESMAN', 'ADMIN'], default: 'USER' },
    status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' },
    avatar: { type: String, default: '' },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
