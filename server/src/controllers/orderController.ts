import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      items, 
      customerMode, 
      customerName, 
      customerMobile, 
      customerAddress, 
      customerCity, 
      customerState, 
      customerEmail, 
      customerType, 
      salesmanId, 
      salesmanName, 
      salesmanPhone,
      expiredItems,
      returnItems
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items array cannot be empty',
        code: 'EMPTY_CART'
      });
    }

    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required',
        code: 'MISSING_CUSTOMER_NAME'
      });
    }

    const processedItems = [];
    let grandTotal = 0;
    let totalQuantity = 0;

    // Concurrency Safety: Atomic Stock Reservation
    for (const item of items) {
      const pId = String(item.id || item.productId || '');
      const qty = parseInt(item.qty || item.quantity, 10);

      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity ${item.qty} for item ${item.name}`,
          code: 'INVALID_QUANTITY'
        });
      }

      const isObjectId = pId.match(/^[0-9a-fA-F]{24}$/);
      
      // Atomic MongoDB findOneAndUpdate with stock condition $gte: qty to prevent overselling race conditions
      const updatedProduct = await Product.findOneAndUpdate(
        { 
          $or: [{ productId: pId }, { sku: item.sku }, { _id: isObjectId ? pId : null }],
          stock: { $gte: qty }
        },
        { $inc: { stock: -qty } },
        { new: true }
      );

      if (updatedProduct) {
        const unitPrice = updatedProduct.price || item.unitPrice || item.price || 1200;
        const itemTotal = unitPrice * qty;

        processedItems.push({
          productId: updatedProduct.productId,
          sku: updatedProduct.sku,
          productName: updatedProduct.name,
          companyName: updatedProduct.companyName,
          categoryName: updatedProduct.categoryName,
          quantity: qty,
          price: unitPrice,
          packSize: updatedProduct.packSize,
          bundleSize: updatedProduct.bundleSize,
          caseSize: updatedProduct.caseSize,
          isPriority: Boolean(item.isPriority),
          total: itemTotal
        });

        grandTotal += itemTotal;
        totalQuantity += qty;

        // Log Stock Movement
        await InventoryLog.create({
          productId: updatedProduct.productId,
          sku: updatedProduct.sku,
          productName: updatedProduct.name,
          changeType: 'ORDER_DEDUCTION',
          quantityChange: -qty,
          previousStock: updatedProduct.stock + qty,
          newStock: updatedProduct.stock,
          reason: `Order deduction for customer "${customerName}"`,
          performedBy: req.user?.salesmanId || salesmanId || 'SALESMAN',
          adminName: salesmanName || req.user?.name || 'Representative'
        }).catch(() => {});
      } else {
        // Check if product exists but stock is insufficient
        const existingProd = await Product.findOne({ $or: [{ productId: pId }, { sku: item.sku }] });
        if (existingProd) {
          return res.status(400).json({
            success: false,
            message: `Stock conflict: Only ${existingProd.stock} units are currently available for "${existingProd.name}".`,
            code: 'INSUFFICIENT_STOCK'
          });
        }

        // Fallback snapshot for mock/demo item
        const unitPrice = item.unitPrice || item.price || 1200;
        const itemTotal = unitPrice * qty;
        processedItems.push({
          productId: pId || `prod-${Date.now()}`,
          sku: item.sku || 'AE-SKU-100',
          productName: item.name || 'Industrial Item',
          companyName: item.brand || item.company || 'Amul',
          categoryName: item.category || 'Food & Beverages',
          quantity: qty,
          price: unitPrice,
          packSize: item.packSize || '1 Unit',
          bundleSize: item.bundleSize || '5 Units',
          caseSize: item.caseSize || '10 Units',
          isPriority: Boolean(item.isPriority),
          total: itemTotal
        });
        grandTotal += itemTotal;
        totalQuantity += qty;
      }
    }

    const countInvoices = await Invoice.countDocuments();
    const invoiceNumber = `AE-2026-${String(countInvoices + 1).padStart(6, '0')}`;
    const orderId = `ORD-2026-${String(countInvoices + 1).padStart(6, '0')}`;

    const normalizedClassification = (customerType || 'Normal Customer').toUpperCase().includes('DAMAGE')
      ? 'DAMAGE'
      : (customerType || 'Normal Customer').toUpperCase().includes('EXPIRY')
      ? 'EXPIRY'
      : 'NORMAL';

    const customerObj = new Customer({
      customerId: `CUST-${Date.now()}`,
      name: String(customerName).trim(),
      mobile: customerMobile || '',
      email: customerEmail || '',
      address: customerAddress || '',
      city: customerCity || '',
      state: customerState || '',
      classification: normalizedClassification,
      customerMode: customerMode === 'full' ? 'FULL' : 'QUICK',
      createdBy: req.user?.salesmanId || salesmanId || 'AE-SM-001'
    });
    await customerObj.save();

    const order = new Order({
      orderId,
      invoiceNumber,
      salesmanId: salesmanId || req.user?.salesmanId || 'AE-SM-001',
      salesmanName: salesmanName || req.user?.name || 'Rajesh Kumar',
      customerId: customerObj.customerId,
      customerName: String(customerName).trim(),
      customerClassification: normalizedClassification,
      customerDetails: {
        mobile: customerMobile,
        email: customerEmail,
        address: customerAddress,
        city: customerCity,
        state: customerState
      },
      items: processedItems,
      totalQuantity,
      totalAmount: grandTotal,
      expiredItems: expiredItems || [],
      returnItems: returnItems || [],
      hasUrgentItems: processedItems.some(i => i.isPriority),
      hasExpiredItems: Boolean(expiredItems && expiredItems.length > 0),
      hasReturnItems: Boolean(returnItems && returnItems.length > 0),
      orderType: 'OFFLINE_COLLECTION',
      paymentStatus: 'OFFLINE',
      collectionStatus: 'PENDING',
      status: 'CONFIRMED'
    });
    await order.save();

    const invoice = new Invoice({
      invoiceNumber,
      orderId,
      salesmanId: order.salesmanId,
      salesmanName: order.salesmanName,
      customerId: customerObj.customerId,
      customerName: order.customerName,
      customerClassification: normalizedClassification,
      customerMobile: customerMobile || '+91 98200 11223',
      customerAddress: customerAddress || '',
      items: processedItems.map(i => ({
        id: i.productId,
        name: i.productName,
        sku: i.sku,
        qty: i.quantity,
        price: i.price,
        packSize: i.packSize,
        bundleSize: i.bundleSize,
        caseSize: i.caseSize,
        isPriority: Boolean(i.isPriority)
      })),
      expiredItems: expiredItems || [],
      returnItems: returnItems || [],
      hasUrgentItems: processedItems.some(i => i.isPriority),
      hasExpiredItems: Boolean(expiredItems && expiredItems.length > 0),
      hasReturnItems: Boolean(returnItems && returnItems.length > 0),
      subtotal: grandTotal,
      grandTotal,
      paymentStatus: 'OFFLINE',
      collectionStatus: 'PENDING',
      issuedAt: new Date()
    });
    await invoice.save();

    return res.status(201).json({
      success: true,
      data: {
        order: {
          id: invoiceNumber,
          invoiceNumber,
          orderId,
          date: new Date().toISOString().split('T')[0],
          customerName: order.customerName,
          customerMobile: customerMobile || '+91 98200 11223',
          customerAddress: customerAddress || '',
          customerCity: customerCity || '',
          customerState: customerState || '',
          customerType: customerType || 'Normal Customer',
          salesmanId: order.salesmanId,
          salesmanName: order.salesmanName,
          salesmanPhone: salesmanPhone || '+91 98765 43210',
          orderType: 'Offline Collection',
          paymentMode: 'Offline',
          collectionStatus: 'Pending',
          items: processedItems.map(i => ({
            id: i.productId,
            name: i.productName,
            sku: i.sku,
            qty: i.quantity,
            price: i.price,
            packSize: i.packSize,
            bundleSize: i.bundleSize,
            caseSize: i.caseSize,
            isPriority: Boolean(i.isPriority)
          })),
          expiredItems: expiredItems || [],
          returnItems: returnItems || [],
          hasUrgentItems: processedItems.some(i => i.isPriority),
          hasExpiredItems: Boolean(expiredItems && expiredItems.length > 0),
          hasReturnItems: Boolean(returnItems && returnItems.length > 0),
          totalQuantity,
          subtotal: grandTotal,
          grandTotal,
          status: 'Invoiced'
        },
        invoice
      },
      message: 'Order Created Successfully! Invoice Generated. Collection Pending.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { salesmanId, search, status } = req.query;
    const filter: any = {};

    if (salesmanId) {
      filter.salesmanId = String(salesmanId).toUpperCase();
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      const q = String(search).trim();
      filter.$or = [
        { orderId: new RegExp(q, 'i') },
        { invoiceNumber: new RegExp(q, 'i') },
        { customerName: new RegExp(q, 'i') }
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    const formatted = orders.map((o: any) => ({
      id: o.invoiceNumber || o.orderId,
      orderId: o.orderId,
      invoiceNumber: o.invoiceNumber || o.orderId,
      date: new Date(o.createdAt).toISOString().split('T')[0],
      customerName: o.customerName,
      customerType: `${o.customerClassification.charAt(0) + o.customerClassification.slice(1).toLowerCase()} Customer`,
      salesmanId: o.salesmanId,
      salesmanName: o.salesmanName,
      orderType: 'Offline Collection',
      paymentMode: 'Offline',
      collectionStatus: o.collectionStatus === 'PENDING' ? 'Pending' : 'Collected',
      status: o.status,
      items: o.items.map((i: any) => ({
        id: i.productId,
        name: i.productName,
        sku: i.sku,
        qty: i.quantity,
        price: i.price,
        packSize: i.packSize,
        bundleSize: i.bundleSize,
        caseSize: i.caseSize
      })),
      totalQuantity: o.totalQuantity
    }));

    return res.json({
      success: true,
      data: { orders: formatted },
      message: 'Orders retrieved successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const { status, collectionStatus } = req.body || {};
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);

    const order = await Order.findOne({ $or: [{ orderId: idStr }, { invoiceNumber: idStr }, { _id: isObjectId ? idStr : null }] });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Stock Restoration Rule (#24): Restock inventory if order status is updated to CANCELLED
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        await Product.updateOne(
          { $or: [{ productId: item.productId }, { sku: item.sku }] },
          { $inc: { stock: item.quantity } }
        );
      }
    }

    if (status) order.status = status;
    if (collectionStatus) order.collectionStatus = collectionStatus;

    await order.save();

    await AdminActivity.create({
      action: 'ORDER_STATUS_CHANGED',
      adminId: req.user?.id || 'ADMIN',
      details: `Updated order ${order.orderId} status to ${order.status}`
    });

    return res.json({ success: true, data: { order }, message: 'Order status updated' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
