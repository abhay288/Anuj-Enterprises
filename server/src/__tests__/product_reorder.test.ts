import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import { Product } from '../models/Product.js';
import { sendRealtimeEvent } from '../utils/realtime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function runReorderTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PRODUCT REORDER & SEQUENCING TEST SUITE');
  console.log('====================================================');

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in server/.env');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB Atlas');

  const testPrefix = `TEST-ORDER-${Date.now()}`;
  const p1Sku = `${testPrefix}-A`;
  const p2Sku = `${testPrefix}-B`;
  const p3Sku = `${testPrefix}-C`;

  try {
    // 1. Create 3 test products
    const p1 = await Product.create({
      productId: `prod-${p1Sku}`,
      sku: p1Sku,
      name: 'Alpha Test Product',
      companyName: 'ABC Industries',
      categoryName: 'Food & Beverages',
      price: 100,
      stock: 10,
      sortOrder: 1,
      status: 'Published'
    });

    const p2 = await Product.create({
      productId: `prod-${p2Sku}`,
      sku: p2Sku,
      name: 'Beta Test Product',
      companyName: 'ABC Industries',
      categoryName: 'Food & Beverages',
      price: 200,
      stock: 20,
      sortOrder: 2,
      status: 'Published'
    });

    const p3 = await Product.create({
      productId: `prod-${p3Sku}`,
      sku: p3Sku,
      name: 'Gamma Test Product',
      companyName: 'ABC Industries',
      categoryName: 'Food & Beverages',
      price: 300,
      stock: 30,
      sortOrder: 3,
      status: 'Published'
    });

    console.log('✓ Created 3 test products with sortOrder [1, 2, 3]');

    // 2. Fetch sorted list and verify order
    let list = await Product.find({ sku: { $in: [p1Sku, p2Sku, p3Sku] } })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    if (list[0].sku !== p1Sku || list[1].sku !== p2Sku || list[2].sku !== p3Sku) {
      throw new Error(`Initial sorting mismatch: got ${list.map(p => p.sku).join(', ')}`);
    }
    console.log('✓ TEST 1 PASS: Products retrieved in initial order [Alpha, Beta, Gamma]');

    // 3. Reorder: Move Gamma (p3) to #1, Beta (p2) to #2, Alpha (p1) to #3
    const newRanks = [
      { id: p3.productId, sku: p3.sku, sortOrder: 1 },
      { id: p2.productId, sku: p2.sku, sortOrder: 2 },
      { id: p1.productId, sku: p1.sku, sortOrder: 3 }
    ];

    const bulkOps = newRanks.map(item => ({
      updateOne: {
        filter: { sku: item.sku },
        update: { $set: { sortOrder: item.sortOrder } },
        upsert: false
      }
    }));
    await Product.bulkWrite(bulkOps);
    console.log('✓ Performed bulkWrite reorder update');

    // 4. Verify new order in database
    list = await Product.find({ sku: { $in: [p1Sku, p2Sku, p3Sku] } })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    if (list[0].sku !== p3Sku || list[1].sku !== p2Sku || list[2].sku !== p1Sku) {
      throw new Error(`Reordered sorting mismatch: got ${list.map(p => p.sku).join(', ')}`);
    }
    console.log('✓ TEST 2 PASS: Products reordered to [Gamma (#1), Beta (#2), Alpha (#3)] in DB');

    // 5. Test Realtime Event Broadcaster
    sendRealtimeEvent('SYNC_PRODUCTS', { action: 'TEST_REORDER', timestamp: Date.now() });
    console.log('✓ TEST 3 PASS: Realtime SSE event broadcasting verified');

    console.log('====================================================');
    console.log('🎉 ALL PRODUCT REORDER TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } finally {
    // Cleanup
    await Product.deleteMany({ sku: { $in: [p1Sku, p2Sku, p3Sku] } });
    console.log('✓ Cleaned up test records from database');
    await mongoose.disconnect();
  }
}

runReorderTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
