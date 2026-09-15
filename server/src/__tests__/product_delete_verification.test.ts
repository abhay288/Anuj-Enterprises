import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { buildProductLookupQuery } from '../controllers/productController.js';
import { seedDatabase } from '../seeds/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PRODUCT DELETE PERSISTENCE TEST SUITE');
  console.log('====================================================');

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in server/.env');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB Atlas');

  const testSku = 'TEST-DEL-SKU-999';
  const testProdId = 'prod-test-del-999';
  const testName = 'Test Product For Delete Persistence Verification';

  // Ensure clean slate before test
  await Product.deleteMany({ $or: [{ sku: testSku }, { productId: testProdId }] });

  // 1. Create Test Product in MongoDB
  const createdProd = await Product.create({
    productId: testProdId,
    sku: testSku,
    name: testName,
    companyName: 'ABC Industries',
    categoryName: 'Dairy & Frozen Foods',
    description: 'Temporary product created specifically to verify permanent deletion.',
    price: 499,
    mrp: 599,
    stock: 50,
    status: 'Published',
    featured: false,
    newProduct: false,
    images: [{ url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150', isPrimary: true }]
  });

  console.log(`✓ Test product created in MongoDB with ID: ${createdProd._id}, productId: ${createdProd.productId}, SKU: ${createdProd.sku}`);

  // VERIFY: Product exists in DB
  const docBefore = await Product.findOne({ sku: testSku });
  if (!docBefore) {
    throw new Error('TEST FAILED: Product was not inserted into MongoDB');
  }
  console.log('✓ TEST 1a: Product confirmed in MongoDB before delete');

  // 2. Perform Delete using the refactored controller logic
  const query = buildProductLookupQuery(testProdId);
  const deletedDoc = await Product.findOneAndDelete(query);
  if (!deletedDoc) {
    throw new Error('TEST FAILED: Product.findOneAndDelete returned null');
  }
  console.log(`✓ TEST 1b: Product successfully deleted from MongoDB via findOneAndDelete`);

  // 3. Verify Product does NOT exist in MongoDB
  const docAfter = await Product.findOne({ $or: [{ productId: testProdId }, { sku: testSku }, { _id: createdProd._id }] });
  if (docAfter) {
    throw new Error('TEST FAILED: Product still exists in MongoDB after deletion!');
  }
  console.log('✓ TEST 1c: Verified in MongoDB: Document completely removed (PASS)');

  // 4. Test GET /products (Admin query: status='all')
  const adminProducts = await Product.find({}).lean();
  const foundInAdmin = adminProducts.some(p => p.productId === testProdId || p.sku === testSku || p._id.toString() === createdProd._id.toString());
  if (foundInAdmin) {
    throw new Error('TEST FAILED: Deleted product appeared in Admin products query!');
  }
  console.log('✓ TEST 2: Admin products list excludes deleted product (PASS)');

  // 5. Test Customer / Public query (status='Published')
  const customerProducts = await Product.find({ status: 'Published' }).lean();
  const foundInCustomer = customerProducts.some(p => p.productId === testProdId || p.sku === testSku);
  if (foundInCustomer) {
    throw new Error('TEST FAILED: Deleted product appeared in Customer catalogue!');
  }
  console.log('✓ TEST 3: Customer catalogue query excludes deleted product (PASS)');

  // 6. Test Salesman catalogue query
  const salesmanProducts = await Product.find({ status: { $in: ['Published', 'Draft'] } }).lean();
  const foundInSalesman = salesmanProducts.some(p => p.productId === testProdId || p.sku === testSku);
  if (foundInSalesman) {
    throw new Error('TEST FAILED: Deleted product appeared in Salesman catalogue!');
  }
  console.log('✓ TEST 4: Salesman catalogue query excludes deleted product (PASS)');

  // 7. Test Backend Restart / Startup Seeding
  console.log('Simulating backend restart and startup seedDatabase check...');
  await seedDatabase();
  const docAfterSeed = await Product.findOne({ $or: [{ productId: testProdId }, { sku: testSku }] });
  if (docAfterSeed) {
    throw new Error('TEST FAILED: Startup seed recreation brought back deleted product!');
  }
  console.log('✓ TEST 5: Backend restart & seed check does NOT recreate deleted product (PASS)');

  // 8. Test lookup by ID returns 404
  const lookupQuery = buildProductLookupQuery(testProdId);
  const docLookup = await Product.findOne(lookupQuery);
  if (docLookup) {
    throw new Error('TEST FAILED: Deleted product was still found by lookup query!');
  }
  console.log('✓ TEST 6: GET /products/:id lookup query returns null (404) (PASS)');

  console.log('====================================================');
  console.log('🎉 ALL 6 DELETION PERSISTENCE TESTS PASSED CLEANLY!');
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
