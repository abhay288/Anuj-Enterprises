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

    // 1. Seed Admin User
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    await User.deleteMany({ email: 'admin@anujenterprises.demo' });
    await User.create({
      name: 'Anuj Sharma (Managing Director)',
      email: 'admin@anujenterprises.demo',
      phone: '+91 98765 43210',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'Active'
    });
    console.log('✓ Admin user seeded: admin@anujenterprises.demo');

    // 2. Seed Salesman Roster
    const salesmanPasswordHash = await bcrypt.hash('Sales@123', 10);
    await Salesman.deleteMany({ salesmanId: { $in: ['AE-SM-001', 'AE-SM-002'] } });
    await Salesman.create([
      {
        salesmanId: 'AE-SM-001',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@anujenterprises.demo',
        phone: '+91 98765 43210',
        passwordHash: salesmanPasswordHash,
        region: 'South India (Bengaluru Hub)',
        status: 'Active',
        totalOrders: 145,
        totalPurchase: '48,500 Units',
        lastOrderDate: '2026-08-12'
      },
      {
        salesmanId: 'AE-SM-002',
        name: 'Priya Sharma',
        email: 'priya.sharma@anujenterprises.demo',
        phone: '+91 98201 55667',
        passwordHash: salesmanPasswordHash,
        region: 'West India (Mumbai Corporate HQ)',
        status: 'Active',
        totalOrders: 98,
        totalPurchase: '32,100 Units',
        lastOrderDate: '2026-08-11'
      }
    ]);
    console.log('✓ Salesman roster seeded: AE-SM-001 & AE-SM-002');

    // 3. Seed Companies (Brands)
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
    console.log('✓ Companies seeded including ABC Industries');

    // 4. Seed Categories
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
    console.log('✓ Categories seeded');

    // 5. Seed Products
    const productsData = [
      {
        productId: 'prod-abc-101',
        sku: 'ABC-PRT-100G',
        name: 'ABC Premium Industrial Organic Protein Bars 100g (Carton of 24)',
        companyName: 'ABC Industries',
        categoryName: 'Food & Beverages',
        price: 1850,
        mrp: 2200,
        stock: 350,
        packSize: '100g Bar',
        bundleSize: '6 Bars',
        caseSize: '24 Bars',
        featured: true,
        newProduct: true,
        status: 'Published',
        description: 'New Arrival flagship high-energy organic protein bar manufactured by ABC Industries for bulk commercial supply chains.',
        images: [{ url: 'https://images.unsplash.com/photo-1622484210800-8851b576f926?auto=format&fit=crop&w=800&q=80', isPrimary: true, whiteBackground: true }]
      },
      {
        productId: 'prod-fmcg-101',
        sku: 'AML-GLD-1L-12',
        name: 'Amul Gold Full Cream Milk 1L Tetra Pack (Master Case of 12)',
        companyName: 'Amul',
        categoryName: 'Dairy & Frozen Foods',
        price: 890,
        mrp: 960,
        stock: 450,
        packSize: '1 Litre',
        bundleSize: '6 Units',
        caseSize: '12 Units',
        featured: true,
        newProduct: false,
        status: 'Published',
        description: 'Pasteurized homogenized full cream milk with 6.0% fat and 9.0% SNF. Long shelf life 180-day packaging.',
        images: [{ url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80', isPrimary: true, whiteBackground: true }]
      },
      {
        productId: 'prod-fmcg-102',
        sku: 'BRT-NTR-DIG-24',
        name: 'Britannia NutriChoice Digestive Biscuits 1kg (Carton of 24)',
        companyName: 'Britannia',
        categoryName: 'Confectionery & Snacks',
        price: 1680,
        mrp: 1920,
        stock: 280,
        packSize: '200g Pack',
        bundleSize: '6 Packs',
        caseSize: '24 Packs',
        featured: true,
        newProduct: false,
        status: 'Published',
        description: 'High fibre digestive biscuits packed with 100% wholewheat goodness for corporate pantries.',
        images: [{ url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80', isPrimary: true, whiteBackground: true }]
      },
      {
        productId: 'prod-fmcg-103',
        sku: 'NST-MAG-70G-96',
        name: 'Nestle Maggi 2-Minute Masala Noodles 70g (Master Carton of 96)',
        companyName: 'Nestle',
        categoryName: 'Food & Beverages',
        price: 1280,
        mrp: 1440,
        stock: 600,
        packSize: '70g Single',
        bundleSize: '12 Singles',
        caseSize: '96 Singles',
        featured: true,
        newProduct: false,
        status: 'Published',
        description: 'India favourite instant noodles infused with roasted spices. Bulk commercial poly-pack casing.',
        images: [{ url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80', isPrimary: true, whiteBackground: true }]
      }
    ];

    for (const p of productsData) {
      await Product.findOneAndUpdate({ sku: p.sku }, p, { upsert: true, new: true });
    }
    console.log('✓ Initial FMCG product catalogue seeded');

    // 6. Seed Sample Order & Invoice
    const sampleOrder = {
      orderId: 'ORD-2026-000001',
      invoiceNumber: 'AE-2026-000001',
      salesmanId: 'AE-SM-001',
      salesmanName: 'Rajesh Kumar',
      customerName: 'Reliance Retail Wholesale Chains',
      customerClassification: 'NORMAL',
      customerDetails: {
        mobile: '+91 98200 11223',
        address: 'Bhiwandi Central B2B Logistics Hub',
        city: 'Thane',
        state: 'Maharashtra'
      },
      items: [
        {
          productId: 'prod-fmcg-101',
          sku: 'AML-GLD-1L-12',
          productName: 'Amul Gold Full Cream Milk 1L Tetra Pack (Master Case of 12)',
          companyName: 'Amul',
          categoryName: 'Dairy & Frozen Foods',
          quantity: 20,
          price: 890,
          packSize: '1 Litre',
          bundleSize: '6 Units',
          caseSize: '12 Units',
          total: 17800
        }
      ],
      totalQuantity: 20,
      totalAmount: 17800,
      orderType: 'OFFLINE_COLLECTION',
      paymentStatus: 'OFFLINE',
      collectionStatus: 'PENDING',
      status: 'CONFIRMED'
    };

    await Order.findOneAndUpdate({ orderId: sampleOrder.orderId }, sampleOrder, { upsert: true, new: true });

    await Invoice.findOneAndUpdate({ invoiceNumber: 'AE-2026-000001' }, {
      invoiceNumber: 'AE-2026-000001',
      orderId: 'ORD-2026-000001',
      salesmanId: 'AE-SM-001',
      salesmanName: 'Rajesh Kumar',
      customerName: 'Reliance Retail Wholesale Chains',
      customerClassification: 'NORMAL',
      customerMobile: '+91 98200 11223',
      customerAddress: 'Bhiwandi Central B2B Logistics Hub, Thane, Maharashtra',
      items: [
        {
          id: 'prod-fmcg-101',
          name: 'Amul Gold Full Cream Milk 1L Tetra Pack (Master Case of 12)',
          sku: 'AML-GLD-1L-12',
          qty: 20,
          price: 890,
          packSize: '1 Litre',
          bundleSize: '6 Units',
          caseSize: '12 Units'
        }
      ],
      subtotal: 17800,
      grandTotal: 17800,
      paymentStatus: 'OFFLINE',
      collectionStatus: 'PENDING',
      issuedAt: new Date()
    }, { upsert: true, new: true });

    console.log('✓ Sample Order & Invoice AE-2026-000001 seeded');
    console.log('Seed completed successfully!');

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
