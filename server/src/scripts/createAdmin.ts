import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anuj_enterprises';

export const createAdminUser = async (email?: string, password?: string, name?: string) => {
  const adminEmail = (email || process.argv[2] || 'anujenterprises.fmcg.006@gmail.com').toLowerCase().trim();
  const adminPassword = password || process.argv[3] || 'Anuj@2026';
  const adminName = name || process.argv[4] || 'ANUJ';

  console.log('----------------------------------------------------');
  console.log('👑 ANUJ ENTERPRISES — ADMIN ACCOUNT CREATOR / RESET');
  console.log('----------------------------------------------------');
  console.log(`📧 Admin Email:    ${adminEmail}`);
  console.log(`👤 Admin Name:     ${adminName}`);
  console.log(`🔑 Admin Password: ${adminPassword}`);
  console.log('----------------------------------------------------');

  try {
    console.log(`Connecting to database...`);
    await mongoose.connect(MONGODB_URI);

    // 1. Hash password securely with bcrypt (10 rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // 2. Upsert Admin User in MongoDB
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      existing.name = adminName;
      existing.passwordHash = passwordHash;
      existing.role = 'ADMIN';
      existing.status = 'Active';
      await existing.save();
      console.log(`✅ [SUCCESS] Admin account for "${adminEmail}" was successfully UPDATED in MongoDB.`);
    } else {
      const newAdmin = new User({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'Active',
        phone: '+91 88876 83782'
      });
      await newAdmin.save();
      console.log(`🎉 [SUCCESS] New Admin account for "${adminEmail}" was successfully CREATED in MongoDB.`);
    }

    console.log('----------------------------------------------------');
    console.log('You can now log into the web platform with these credentials:');
    console.log(`URL:      http://localhost:3000`);
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ [ERROR] Failed to create admin in database:', error.message);
    process.exit(1);
  }
};

createAdminUser();
