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

    // 1. Seed Base Companies (Brands) ONLY if collection is empty
    const existingCompanyCount = await Company.countDocuments();
    if (existingCompanyCount === 0) {
      const companyList = [
        { name: 'Anand Bakery', featured: true, isNew: true, rank: 1 },
        { name: 'All Time', featured: true, isNew: true, rank: 2 },
        { name: 'VTC', featured: true, isNew: true, rank: 3 },
        { name: 'Cook Yumm', featured: true, isNew: true, rank: 4 },
        { name: "Kay's India", featured: true, isNew: true, rank: 5 },
        { name: 'Too Yumm', featured: true, isNew: true, rank: 6 },
        { name: 'Others Brand', featured: false, isNew: true, rank: 7 },
        { name: 'Amul', featured: true, isNew: false, rank: 8 },
        { name: 'Britannia', featured: true, isNew: false, rank: 9 },
        { name: 'Nestle', featured: true, isNew: false, rank: 10 },
        { name: 'ITC Limited', featured: false, isNew: false, rank: 11 },
        { name: 'Dabur', featured: false, isNew: false, rank: 12 }
      ];
      await Company.insertMany(companyList);
      console.log('✓ Base Companies seeded (fresh database)');
    } else {
      console.log(`✓ Companies already exist (${existingCompanyCount} records) — skipping seed to preserve admin changes`);
    }

    // 2. Seed Base Categories ONLY if collection is empty
    const existingCategoryCount = await Category.countDocuments();
    if (existingCategoryCount === 0) {
      const categoryList = [
        { name: 'Dairy & Frozen Foods' },
        { name: 'Confectionery & Snacks' },
        { name: 'Personal Care & Beauty' },
        { name: 'Beverages & Juices' },
        { name: 'Home Care & Hygiene' },
        { name: 'Food & Beverages' }
      ];
      await Category.insertMany(categoryList);
      console.log('✓ Base Categories seeded (fresh database)');
    } else {
      console.log(`✓ Categories already exist (${existingCategoryCount} records) — skipping seed to preserve admin changes`);
    }

    console.log('Production seeding check completed successfully!');

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
