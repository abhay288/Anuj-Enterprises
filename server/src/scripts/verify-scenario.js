import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import mongoose from 'mongoose';
import { app } from '../../dist/app.js';
import { Order } from '../../dist/models/Order.js';
import { Invoice } from '../../dist/models/Invoice.js';
import { connectDB } from '../../dist/config/db.js';
import http from 'http';

async function runScenarioTest() {
  console.log('🚀 Starting Exact Two-Customer Invoice Generation Test...');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, () => resolve(true)));
  console.log('✅ Test server listening on http://127.0.0.1:5099');

  const postOrder = async (payload) => {
    const res = await fetch('http://127.0.0.1:5099/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  const getOrders = async () => {
    const res = await fetch('http://127.0.0.1:5099/api/v1/orders', {
      headers: { 'x-admin-auth': 'true' }
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  // Test A: Rahul Store with Product A and Product B
  console.log('\n--- 1. Generating Invoice for Customer A: Rahul Store ---');
  const payloadA = {
    customerName: 'Rahul Store',
    customerMobile: '9876543210',
    customerAddress: '12/45 Naveen Market, Kanpur',
    customerCity: 'Kanpur',
    customerState: 'Uttar Pradesh',
    salesmanName: 'Central Kanpur HQ',
    salesmanId: 'AE-SM-001',
    description: 'B2B order for Rahul Store',
    customerMode: 'REGISTERED',
    items: [
      {
        productId: 'prod-bread-rusk',
        sku: 'SKU-RUSK-01',
        name: 'Product A: Anand Bakery Bread Rusk',
        productName: 'Product A: Anand Bakery Bread Rusk',
        quantity: 10,
        qty: 10,
        price: 45,
        unitPrice: 45,
        packSize: 'Packet'
      },
      {
        productId: 'prod-yeast',
        sku: 'SKU-YEAST-01',
        name: 'Product B: All Time Active Dried Yeast',
        productName: 'Product B: All Time Active Dried Yeast',
        quantity: 5,
        qty: 5,
        price: 120,
        unitPrice: 120,
        packSize: 'Tin'
      }
    ]
  };

  const resA = await postOrder(payloadA);
  const orderAData = resA.data?.data?.order || resA.data?.data;
  const invoiceAData = resA.data?.data?.invoice;
  console.log('Order A Response:', {
    success: resA.data?.success,
    orderId: orderAData?.orderId,
    invoiceNumber: invoiceAData?.invoiceNumber || orderAData?.invoiceNumber,
    customerName: orderAData?.customerName,
    itemsCount: orderAData?.items?.length
  });

  if (!resA.data?.success || !orderAData?.invoiceNumber) {
    throw new Error('Failed to create Invoice A: ' + JSON.stringify(resA.data));
  }

  // Test B: Sharma Traders with Product C and Product D
  console.log('\n--- 2. Generating Invoice for Customer B: Sharma Traders ---');
  const payloadB = {
    customerName: 'Sharma Traders',
    customerMobile: '9123456789',
    customerAddress: '88/90 Govind Nagar, Kanpur',
    customerCity: 'Kanpur',
    customerState: 'Uttar Pradesh',
    salesmanName: 'Central Kanpur HQ',
    salesmanId: 'AE-SM-001',
    description: 'B2B order for Sharma Traders',
    customerMode: 'REGISTERED',
    items: [
      {
        productId: 'prod-sweet-roll',
        sku: 'SKU-ROLL-01',
        name: 'Product C: Parag Sweet Roll',
        productName: 'Product C: Parag Sweet Roll',
        quantity: 15,
        qty: 15,
        price: 30,
        unitPrice: 30,
        packSize: 'Box'
      },
      {
        productId: 'prod-noodles',
        sku: 'SKU-NOODLE-01',
        name: 'Product D: Desi Hakka noodles',
        productName: 'Product D: Desi Hakka noodles',
        quantity: 20,
        qty: 20,
        price: 60,
        unitPrice: 60,
        packSize: 'Packet'
      }
    ]
  };

  const resB = await postOrder(payloadB);
  const orderBData = resB.data?.data?.order || resB.data?.data;
  const invoiceBData = resB.data?.data?.invoice;
  console.log('Order B Response:', {
    success: resB.data?.success,
    orderId: orderBData?.orderId,
    invoiceNumber: invoiceBData?.invoiceNumber || orderBData?.invoiceNumber,
    customerName: orderBData?.customerName,
    itemsCount: orderBData?.items?.length
  });

  if (!resB.data?.success || !orderBData?.invoiceNumber) {
    throw new Error('Failed to create Invoice B: ' + JSON.stringify(resB.data));
  }

  // Verification 1: MongoDB Direct Document Inspection
  console.log('\n--- 3. Verifying MongoDB Database Records ---');
  const orderAInDb = await Order.findOne({ orderId: orderAData.orderId });
  const orderBInDb = await Order.findOne({ orderId: orderBData.orderId });
  const invoiceAInDb = await Invoice.findOne({ invoiceNumber: invoiceAData?.invoiceNumber || orderAData.invoiceNumber });
  const invoiceBInDb = await Invoice.findOne({ invoiceNumber: invoiceBData?.invoiceNumber || orderBData.invoiceNumber });

  console.log('Invoice A in MongoDB:', {
    id: invoiceAInDb?._id?.toString(),
    invoiceNumber: invoiceAInDb?.invoiceNumber,
    orderId: invoiceAInDb?.orderId,
    customerName: invoiceAInDb?.customerName,
    items: invoiceAInDb?.items?.map(i => i.name)
  });

  console.log('Invoice B in MongoDB:', {
    id: invoiceBInDb?._id?.toString(),
    invoiceNumber: invoiceBInDb?.invoiceNumber,
    orderId: invoiceBInDb?.orderId,
    customerName: invoiceBInDb?.customerName,
    items: invoiceBInDb?.items?.map(i => i.name)
  });

  // Strict checks
  if (!orderAInDb || !orderBInDb) {
    throw new Error('FAILED: One or both orders missing in MongoDB');
  }
  if (!invoiceAInDb || !invoiceBInDb) {
    throw new Error('FAILED: One or both invoices missing in MongoDB');
  }
  if (orderAInDb._id.toString() === orderBInDb._id.toString()) {
    throw new Error('FAILED: Order documents share the same MongoDB _id!');
  }
  if (invoiceAInDb._id.toString() === invoiceBInDb._id.toString()) {
    throw new Error('FAILED: Invoice documents share the same MongoDB _id!');
  }
  if (invoiceAInDb.invoiceNumber === invoiceBInDb.invoiceNumber) {
    throw new Error('FAILED: Invoice numbers are identical!');
  }
  if (orderAInDb.orderId === orderBInDb.orderId) {
    throw new Error('FAILED: Order IDs are identical!');
  }
  if (invoiceAInDb.customerName !== 'Rahul Store' || invoiceBInDb.customerName !== 'Sharma Traders') {
    throw new Error(`FAILED: Customer names merged! A: "${invoiceAInDb.customerName}", B: "${invoiceBInDb.customerName}"`);
  }

  // Verify product separation
  const itemsA = invoiceAInDb.items.map(i => i.name);
  const itemsB = invoiceBInDb.items.map(i => i.name);
  if (itemsA.some(n => n.includes('Product C') || n.includes('Product D'))) {
    throw new Error('FAILED: Products from B leaked into Invoice A!');
  }
  if (itemsB.some(n => n.includes('Product A') || n.includes('Product B'))) {
    throw new Error('FAILED: Products from A leaked into Invoice B!');
  }
  if (itemsA.length !== 2 || itemsB.length !== 2) {
    throw new Error(`FAILED: Product counts wrong! A: ${itemsA.length}, B: ${itemsB.length}`);
  }

  console.log('✅ [PASSED] Both invoices exist as independent records with distinct IDs and separate products in MongoDB!');

  // Verification 2: GET /api/v1/orders (Admin View & Refresh Simulation)
  console.log('\n--- 4. Testing Admin View & Refresh (GET /api/v1/orders) ---');
  const adminOrdersRes = await getOrders();
  const allOrders = adminOrdersRes.data?.data?.orders || adminOrdersRes.data?.data || [];
  const targetInvoiceNumA = invoiceAData?.invoiceNumber || orderAData?.invoiceNumber;
  const targetInvoiceNumB = invoiceBData?.invoiceNumber || orderBData?.invoiceNumber;
  const foundA = allOrders.find(o => o.orderId === orderAData.orderId || o.invoiceNumber === targetInvoiceNumA);
  const foundB = allOrders.find(o => o.orderId === orderBData.orderId || o.invoiceNumber === targetInvoiceNumB);

  console.log('Admin List contains Customer A Invoice:', Boolean(foundA), foundA?.invoiceNumber, foundA?.customerName);
  console.log('Admin List contains Customer B Invoice:', Boolean(foundB), foundB?.invoiceNumber, foundB?.customerName);

  if (!foundA || !foundB) {
    throw new Error('FAILED: One or both invoices are missing from the Admin Orders list');
  }
  if (foundA.invoiceNumber === foundB.invoiceNumber) {
    throw new Error('FAILED: Both orders in Admin view have the same invoice number');
  }

  // Verification 3: Concurrency Test - Generating two invoices quickly in parallel
  console.log('\n--- 5. Concurrency Test: Generating Two Invoices Simultaneously ---');
  const [fastRes1, fastRes2] = await Promise.all([
    postOrder({
      customerName: 'Quick Customer 1',
      customerMobile: '9000000001',
      customerAddress: 'Kanpur Market 1',
      items: [{ productId: 'p1', name: 'Item 1', quantity: 1, price: 10 }]
    }),
    postOrder({
      customerName: 'Quick Customer 2',
      customerMobile: '9000000002',
      customerAddress: 'Kanpur Market 2',
      items: [{ productId: 'p2', name: 'Item 2', quantity: 1, price: 20 }]
    })
  ]);

  const fast1Inv = fastRes1.data?.data?.invoice?.invoiceNumber || fastRes1.data?.data?.order?.invoiceNumber;
  const fast2Inv = fastRes2.data?.data?.invoice?.invoiceNumber || fastRes2.data?.data?.order?.invoiceNumber;

  console.log('FastRes1 status & body:', fastRes1.status, JSON.stringify(fastRes1.data));
  console.log('FastRes2 status & body:', fastRes2.status, JSON.stringify(fastRes2.data));
  console.log('Concurrent Fast Invoice 1:', fast1Inv, fastRes1.data?.data?.order?.customerName);
  console.log('Concurrent Fast Invoice 2:', fast2Inv, fastRes2.data?.data?.order?.customerName);

  if (!fast1Inv || !fast2Inv || fast1Inv === fast2Inv) {
    throw new Error('FAILED: Concurrent invoice numbers collided or failed to generate!');
  }

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Invoices are completely isolated and independent.');

  server.close();
  await mongoose.disconnect();
  process.exit(0);
}

runScenarioTest().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
