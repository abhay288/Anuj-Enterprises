import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const PROD_ADMIN_EMAIL = process.env.PROD_ADMIN_EMAIL || 'admin@anujenterprises.com';
const PROD_ADMIN_PASSWORD = process.env.PROD_ADMIN_PASSWORD || 'AnujAdmin#2026!Secure';

export const bootstrapProductionAdmin = async () => {
  if (!MONGODB_URI) {
    console.error('PROD SEED ERROR: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB for Production Admin Bootstrap...`);
    await mongoose.connect(MONGODB_URI);

    const existingAdmin = await User.findOne({ email: PROD_ADMIN_EMAIL.toLowerCase() });
    if (existingAdmin) {
      console.log(`✓ Production Admin account (${PROD_ADMIN_EMAIL}) already exists.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(PROD_ADMIN_PASSWORD, 12);
    const prodAdmin = new User({
      name: 'Managing Director (Production Admin)',
      email: PROD_ADMIN_EMAIL.toLowerCase(),
      phone: '+91 98765 43210',
      passwordHash,
      role: 'ADMIN',
      status: 'Active'
    });

    await prodAdmin.save();
    console.log(`✅ Production Admin account (${PROD_ADMIN_EMAIL}) successfully created.`);
    process.exit(0);
  } catch (error) {
    console.error('Bootstrap Error:', error);
    process.exit(1);
  }
};

bootstrapProductionAdmin();
