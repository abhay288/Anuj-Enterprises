import { Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { parsePagination, escapeRegex } from '../utils/securityUtils.js';

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
          changeType: 'DISPATCH',
          quantity: -qty,
          previousStock: updatedProduct.stock + qty,
          newStock: updatedProduct.stock,
          reason: `Dispatched via Order Booking`,
          referenceId: `ORD-${Date.now()}`
        });
      } else {
        // Stock exhaustion check
        const existingProduct = await Product.findOne({
          $or: [{ productId: pId }, { sku: item.sku }, { _id: isObjectId ? pId : null }]
        });
        const currentStock = existingProduct ? existingProduct.stock : 0;
        
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${item.name || item.sku}". Requested: ${qty}, Available in Warehouse: ${currentStock}`,
          code: 'STOCK_UNAVAILABLE'
        });
      }
    }

    const orderCount = await Order.countDocuments();
    const orderId = `ORD-2026-${String(orderCount + 101).padStart(4, '0')}`;
    const invoiceNumber = `AE-INV-2026-${String(orderCount + 101).padStart(4, '0')}`;

    // Normalize customer classification
    let normalizedClassification: 'NORMAL' | 'DAMAGE' | 'EXPIRY' = 'NORMAL';
    if (customerType === 'Damage Customer' || customerType === 'DAMAGE') normalizedClassification = 'DAMAGE';
    if (customerType === 'Expiry Customer' || customerType === 'EXPIRY') normalizedClassification = 'EXPIRY';

    // Auto-create or Update Customer in Roster
    let customerObj = await Customer.findOne({ 
      $or: [
        { phone: customerMobile }, 
        { name: new RegExp(`^${escapeRegex(customerName)}$`, 'i') }
      ] 
    });

    if (!customerObj) {
      const custCount = await Customer.countDocuments();
      customerObj = new Customer({
        customerId: `AE-CUST-${String(custCount + 101).padStart(3, '0')}`,
        name: customerName,
        phone: customerMobile || '+91 98200 11223',
        email: customerEmail || 'orders@customer.demo',
        address: customerAddress || '',
        city: customerCity || 'Kanpur',
        state: customerState || 'Uttar Pradesh',
        classification: normalizedClassification,
        totalOrders: 1,
        totalSpent: grandTotal,
        lastOrderDate: new Date()
      });
      await customerObj.save();
    } else {
      customerObj.totalOrders = (customerObj.totalOrders || 0) + 1;
      customerObj.totalSpent = (customerObj.totalSpent || 0) + grandTotal;
      customerObj.lastOrderDate = new Date();
      customerObj.classification = normalizedClassification;
      if (customerAddress) customerObj.address = customerAddress;
      if (customerCity) customerObj.city = customerCity;
      if (customerState) customerObj.state = customerState;
      await customerObj.save();
    }

    const order = new Order({
      orderId,
      invoiceNumber,
      customerName: customerObj.name,
      customerClassification: normalizedClassification,
      salesmanId: salesmanId || req.user?.salesmanId || 'AE-SM-001',
      salesmanName: salesmanName || req.user?.name || 'Field Sales Executive',
      shippingAddress: {
        street: customerAddress || '',
        city: customerCity || '',
        state: customerState || '',
        pincode: ''
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
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    const { salesmanId, search, status } = req.query;
    const filter: any = {};

    // Horizontal Privilege Access Control:
    if (req.user.role === 'SALESMAN') {
      // Salesman can only query their own orders
      const userSalesmanId = req.user.salesmanId || req.user.id;
      filter.salesmanId = String(userSalesmanId).toUpperCase();
    } else if (req.user.role === 'USER') {
      // Normal user can only see their own customer orders
      filter.$or = [
        { customerName: req.user.name },
        { 'shippingAddress.street': req.user.email }
      ];
    } else if (req.user.role === 'ADMIN') {
      // Admin can view all or filter by specific salesman
      if (salesmanId) {
        filter.salesmanId = String(salesmanId).toUpperCase();
      }
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      const qEscaped = escapeRegex(String(search).trim());
      const searchRegex = new RegExp(qEscaped, 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { orderId: searchRegex },
          { invoiceNumber: searchRegex },
          { customerName: searchRegex }
        ]
      });
    }

    const { limit, skip, page } = parsePagination(req.query, 50, 100);

    const [orders, totalCount] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter)
    ]);

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
      data: { 
        orders: formatted,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      },
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

    // Stock Restoration Rule: Restock inventory if order status is updated to CANCELLED
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
