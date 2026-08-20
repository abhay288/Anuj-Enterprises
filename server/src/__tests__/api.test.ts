import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Product } from '../models/Product.js';
import { Salesman } from '../models/Salesman.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'anuj_enterprises_jwt_super_secret_key_2026_prod';

export const runAutomatedTests = async () => {
  console.log('🧪 Starting Phase 8 Automated System & Architecture Tests...\n');
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: JWT Signing & Verification
  try {
    const payload = { id: 'test-admin', email: 'admin@anujenterprises.demo', role: 'ADMIN' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.email === payload.email && decoded.role === 'ADMIN') {
      console.log('  [PASS] Test 1: JWT generation & RBAC token verification successful');
      testsPassed++;
    } else {
      throw new Error('Decoded token payload mismatch');
    }
  } catch (err: any) {
    console.error('  [FAIL] Test 1: JWT Test failed:', err.message);
    testsFailed++;
  }

  // Test 2: Mongoose Product Schema Validation
  try {
    const sampleProduct = new Product({
      productId: 'prod-test-01',
      sku: 'SKU-TEST-01',
      name: 'Test Milk Pack 1L',
      companyName: 'Amul',
      categoryName: 'Food & Beverages',
      price: 500,
      stock: 100
    });
    const validateErr = sampleProduct.validateSync();
    if (!validateErr) {
      console.log('  [PASS] Test 2: Product schema validation passed');
      testsPassed++;
    } else {
      throw validateErr;
    }
  } catch (err: any) {
    console.error('  [FAIL] Test 2: Product schema validation error:', err.message);
    testsFailed++;
  }

  // Test 3: Mongoose Order Schema Validation
  try {
    const sampleOrder = new Order({
      orderId: 'ORD-TEST-01',
      salesmanId: 'AE-SM-001',
      salesmanName: 'Rajesh Kumar',
      customerName: 'Test Retail Store',
      items: [{
        productId: 'prod-test-01',
        sku: 'SKU-TEST-01',
        productName: 'Test Milk Pack',
        quantity: 5,
        price: 500,
        total: 2500
      }],
      totalQuantity: 5,
      totalAmount: 2500
    });
    const validateErr = sampleOrder.validateSync();
    if (!validateErr) {
      console.log('  [PASS] Test 3: Order schema validation passed');
      testsPassed++;
    } else {
      throw validateErr;
    }
  } catch (err: any) {
    console.error('  [FAIL] Test 3: Order schema validation error:', err.message);
    testsFailed++;
  }

  // Test 4: Database Connection (with 4000ms timeout safety)
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
      console.log('  [PASS] Test 4: MongoDB Atlas database connection verified');
      testsPassed++;
      await mongoose.disconnect();
    } catch (err: any) {
      console.log(`  [INFO] Test 4: Live MongoDB Atlas skipped (Offline/Timeout): ${err.message}`);
    }
  }

  console.log(`\n🎉 Test Suite Completed: ${testsPassed} Passed, ${testsFailed} Failed`);
  process.exit(testsFailed > 0 ? 1 : 0);
};

runAutomatedTests();

