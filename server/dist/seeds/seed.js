import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Salesman } from '../models/Salesman.js';
import { Company } from '../models/Company.js';
import { Category } from '../models/Category.js';
import { Setting } from '../models/Setting.js';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anuj_enterprises';
export const seedDatabase = async () => {
    try {
        // 0. Production Guard: If database was ever initialized, NEVER recreate deleted items
        const seededFlag = await Setting.findOne({ key: 'system_initial_seeded' });
        if (seededFlag) {
            console.log('✓ System already initialized — skipping seed check to guarantee deleted items are never recreated');
            return;
        }
        console.log('Seeding MongoDB database (initial fresh setup)...');
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
        }
        else {
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
        }
        else {
            console.log(`✓ Categories already exist (${existingCategoryCount} records) — skipping seed to preserve admin changes`);
        }
        // 3. Ensure Default Salesmen exist if collection is empty
        const existingSalesmanCount = await Salesman.countDocuments();
        if (existingSalesmanCount === 0) {
            const salesmanPasswordHash = await bcrypt.hash('Sales@123', 10);
            await Salesman.create([
                {
                    salesmanId: 'AE-SM-001',
                    name: 'Ramesh Kumar',
                    email: 'salesman@anujfmcg.com',
                    phone: '+91 98765 00001',
                    passwordHash: salesmanPasswordHash,
                    region: 'Central UP (Kanpur HQ)',
                    status: 'Active',
                    totalOrders: 28,
                    totalPurchase: '1,450 Units'
                },
                {
                    salesmanId: 'AE-SM-002',
                    name: 'Vikram Singh',
                    email: 'vikram@anujfmcg.com',
                    phone: '+91 98765 00002',
                    passwordHash: salesmanPasswordHash,
                    region: 'East UP (Lucknow Hub)',
                    status: 'Active',
                    totalOrders: 19,
                    totalPurchase: '820 Units'
                }
            ]);
            console.log('✓ Default Salesmen seeded (AE-SM-001, AE-SM-002)');
        }
        // 4. Ensure Default Admin exists
        const adminExists = await User.findOne({ email: 'admin@anujfmcg.com' });
        if (!adminExists) {
            const adminPasswordHash = await bcrypt.hash('Anuj@2026', 10);
            await User.create({
                name: 'Managing Director (Admin)',
                email: 'admin@anujfmcg.com',
                phone: '+91 88876 83782',
                passwordHash: adminPasswordHash,
                role: 'ADMIN',
                status: 'Active'
            });
            console.log('✓ Default Admin seeded (admin@anujfmcg.com)');
        }
        // Mark system as seeded so deleted items can never be resurrected
        await Setting.findOneAndUpdate({ key: 'system_initial_seeded' }, { key: 'system_initial_seeded', value: true }, { upsert: true });
        console.log('Production seeding check completed successfully!');
        if (process.argv[1].endsWith('seed.ts')) {
            process.exit(0);
        }
    }
    catch (error) {
        console.error('Seed Error:', error);
    }
};
if (process.argv[1].endsWith('seed.ts')) {
    seedDatabase();
}
