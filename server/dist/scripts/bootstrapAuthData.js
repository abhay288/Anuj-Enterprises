import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { Salesman } from '../models/Salesman.js';
import { Customer } from '../models/Customer.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anuj_enterprises';
export const bootstrapAuthData = async () => {
    console.log('----------------------------------------------------');
    console.log('🚀 BOOTSTRAPPING AUTHENTICATION DATA IN MONGODB');
    console.log('----------------------------------------------------');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully.');
        // 1. Primary Enterprise Admin: anujenterprises.fmcg.006@gmail.com
        const adminPasswordHash = await bcrypt.hash('Anuj@006', 10);
        await User.findOneAndUpdate({ email: 'anujenterprises.fmcg.006@gmail.com' }, {
            name: 'Anuj (Managing Director)',
            email: 'anujenterprises.fmcg.006@gmail.com',
            phone: '+91 88876 83782',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
            status: 'Active',
            passwordChangedAt: new Date()
        }, { upsert: true, new: true });
        console.log(`✅ [ADMIN] anujenterprises.fmcg.006@gmail.com ready (Password: Anuj@006)`);
        // 2. Secondary Domain Admin: admin@anujfmcg.com
        await User.findOneAndUpdate({ email: 'admin@anujfmcg.com' }, {
            name: 'Managing Director (Admin)',
            email: 'admin@anujfmcg.com',
            phone: '+91 88876 83782',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
            status: 'Active',
            passwordChangedAt: new Date()
        }, { upsert: true, new: true });
        console.log(`✅ [ADMIN] admin@anujfmcg.com ready (Password: Anuj@006)`);
        // 3. Purge all Demo Admin accounts
        await User.deleteMany({
            email: { $in: ['admin@anujenterprises.demo', 'demo@anujenterprises.com', 'demo@anujfmcg.com'] }
        });
        console.log(`🧹 Purged all demo admin accounts from MongoDB`);
        // 4. Ensure Salesman: AE-SM-001
        const salesmanPasswordHash = await bcrypt.hash('Sales@123', 10);
        await Salesman.findOneAndUpdate({ salesmanId: 'AE-SM-001' }, {
            salesmanId: 'AE-SM-001',
            name: 'Ramesh Kumar',
            email: 'salesman@anujfmcg.com',
            phone: '+91 98765 00001',
            passwordHash: salesmanPasswordHash,
            region: 'Central UP (Kanpur HQ)',
            status: 'Active',
            totalOrders: 28,
            totalPurchase: '1,450 Units'
        }, { upsert: true, new: true });
        console.log(`✅ [SALESMAN] AE-SM-001 ready (Password: Sales@123)`);
        // 5. Ensure Salesman: AE-SM-002
        await Salesman.findOneAndUpdate({ salesmanId: 'AE-SM-002' }, {
            salesmanId: 'AE-SM-002',
            name: 'Vikram Singh',
            email: 'vikram@anujfmcg.com',
            phone: '+91 98765 00002',
            passwordHash: salesmanPasswordHash,
            region: 'East UP (Lucknow Hub)',
            status: 'Active',
            totalOrders: 19,
            totalPurchase: '820 Units'
        }, { upsert: true, new: true });
        console.log(`✅ [SALESMAN] AE-SM-002 ready (Password: Sales@123)`);
        // 6. Ensure Customer User & Customer Profile (retailer@anujfmcg.com / 9876543210)
        const customerPasswordHash = await bcrypt.hash('Cust@123', 10);
        const custUser = await User.findOneAndUpdate({ email: 'retailer@anujfmcg.com' }, {
            name: 'Shree Krishna Kirana Store',
            email: 'retailer@anujfmcg.com',
            phone: '9876543210',
            passwordHash: customerPasswordHash,
            role: 'CUSTOMER',
            status: 'Active'
        }, { upsert: true, new: true });
        await Customer.findOneAndUpdate({ customerId: 'CUST-1001' }, {
            customerId: 'CUST-1001',
            name: 'Shree Krishna Kirana Store',
            ownerName: 'Krishna Gupta',
            phone: '9876543210',
            mobile: '9876543210',
            email: 'retailer@anujfmcg.com',
            address: '124/85, Govind Nagar, Near Chawla Market',
            city: 'Kanpur',
            state: 'Uttar Pradesh',
            classification: 'NORMAL',
            customerMode: 'FULL',
            createdBy: 'AE-SM-001',
            assignedSalesmanId: 'AE-SM-001',
            totalOrders: 12,
            totalSpent: 48500
        }, { upsert: true, new: true });
        console.log(`✅ [CUSTOMER] retailer@anujfmcg.com / 9876543210 ready (Password: Cust@123)`);
        console.log('----------------------------------------------------');
        console.log('🎉 ALL AUTHENTICATION DATA BOOTSTRAPPED SUCCESSFULLY!');
        console.log('----------------------------------------------------');
        await mongoose.disconnect();
        return true;
    }
    catch (err) {
        console.error('❌ Bootstrap Error:', err.message);
        throw err;
    }
};
bootstrapAuthData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
