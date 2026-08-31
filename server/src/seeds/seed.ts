import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Salesman } from '../models/Salesman.js';
import { Company } from '../models/Company.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Invoice } from '../models/Invoice.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anuj_enterprises';

export const seedDatabase = async () => {
  try {
    console.log('Seeding MongoDB database...');
    await mongoose.connect(MONGODB_URI);

    // 1. Seed Base Companies (Brands) if empty
    const companyList = [
      { name: 'ABC Industries', featured: true, isNew: true },
      { name: 'Amul', featured: true, isNew: false },
      { name: 'Britannia', featured: true, isNew: false },
      { name: 'Nestle', featured: true, isNew: false },
      { name: 'ITC Limited', featured: false, isNew: false },
      { name: 'Dabur', featured: false, isNew: false }
    ];
    for (const c of companyList) {
      await Company.findOneAndUpdate({ name: c.name }, c, { upsert: true, new: true });
    }
    console.log('✓ Base Companies seeded');

    // 2. Seed Base Categories
    const categoryList = [
      { name: 'Dairy & Frozen Foods' },
      { name: 'Confectionery & Snacks' },
      { name: 'Personal Care & Beauty' },
      { name: 'Beverages & Juices' },
      { name: 'Home Care & Hygiene' },
      { name: 'Food & Beverages' }
    ];
    for (const cat of categoryList) {
      await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
    }
    console.log('✓ Base Categories seeded');

    console.log('Clean production seeding completed successfully!');

    if (process.argv[1].endsWith('seed.ts')) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seed Error:', error);
  }
};

if (process.argv[1].endsWith('seed.ts')) {
  seedDatabase();
}
