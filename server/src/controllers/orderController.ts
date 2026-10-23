import { Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { parsePagination, escapeRegex } from '../utils/securityUtils.js';
import { sendOrderInvoiceEmail } from '../utils/emailService.js';
import { getNextInvoiceAndOrderNumber } from '../utils/sequenceUtils.js';

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
      shopOwnerName,
      shopOwnerArea,
      shopRoute,
      salesmanId, 
      salesmanName, 
      salesmanPhone,
      salesmanArea,
      salesmanRoute,
      description,
      generatedByRole,
      generatedByName,
      generatedById,
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
        message: 'Shop name is required',
        code: 'MISSING_CUSTOMER_NAME'
      });
    }

    // Buyer details must ALWAYS remain separate from Admin/Salesman details
    const resolvedShopOwnerName = shopOwnerName ? String(shopOwnerName).trim() : '';
    const resolvedShopOwnerArea = shopOwnerArea ? String(shopOwnerArea).trim() : '';
    const resolvedShopRoute = shopRoute ? String(shopRoute).trim() : '';
    const resolvedDescription = description ? String(description).trim() : '';

    const resolvedSalesmanId = String(salesmanId || req.user?.salesmanId || req.user?.id || 'AE-SM-001').toUpperCase().trim();
    const resolvedSalesmanName = String(salesmanName || (req.user?.role === 'SALESMAN' ? req.user.name : '') || 'Sales Representative').trim();

    // Determine invoice generator
    let resolvedGeneratedByRole: 'admin' | 'salesman' | 'customer' = 'salesman';
    let resolvedGeneratedByName = '';
    let resolvedGeneratedById = '';

    if (req.user?.role === 'ADMIN' || generatedByRole === 'admin') {
      resolvedGeneratedByRole = 'admin';
      resolvedGeneratedByName = generatedByName || (req.user?.name && req.user.name !== 'ANUJ ENTERPRISES' ? req.user.name : 'Mr. Anuj Sharma');
      resolvedGeneratedById = 'ADMIN';
    } else if (req.user?.role === 'SALESMAN' || generatedByRole === 'salesman') {
      resolvedGeneratedByRole = 'salesman';
      resolvedGeneratedByName = generatedByName || req.user?.name || resolvedSalesmanName;
      resolvedGeneratedById = generatedById || req.user?.salesmanId || req.user?.id || resolvedSalesmanId;
    } else {
      resolvedGeneratedByRole = (generatedByRole as any) || 'salesman';
      resolvedGeneratedByName = generatedByName || req.user?.name || 'Mr. Anuj Sharma';
      resolvedGeneratedById = generatedById || req.user?.salesmanId || req.user?.id || '';
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
        }).catch(() => {});
      } else {
        // Fallback: If product exists in database, deduct remaining stock (down to 0) and allow order
        const existingProduct = await Product.findOne({
          $or: [{ productId: pId }, { sku: item.sku }, { _id: isObjectId ? pId : null }]
        });

        if (existingProduct) {
          const prevStock = existingProduct.stock || 0;
          existingProduct.stock = Math.max(0, prevStock - qty);
          await existingProduct.save().catch(() => {});

          const unitPrice = existingProduct.price || item.unitPrice || item.price || 1200;
          const itemTotal = unitPrice * qty;

          processedItems.push({
            productId: existingProduct.productId,
            sku: existingProduct.sku,
            productName: existingProduct.name,
            companyName: existingProduct.companyName,
            categoryName: existingProduct.categoryName,
            quantity: qty,
            price: unitPrice,
            packSize: existingProduct.packSize,
            bundleSize: existingProduct.bundleSize,
            caseSize: existingProduct.caseSize,
            isPriority: Boolean(item.isPriority),
            total: itemTotal
          });

          grandTotal += itemTotal;
          totalQuantity += qty;

          await InventoryLog.create({
            productId: existingProduct.productId,
            sku: existingProduct.sku,
            productName: existingProduct.name,
            changeType: 'DISPATCH',
            quantity: -Math.min(prevStock, qty),
            previousStock: prevStock,
            newStock: existingProduct.stock,
            reason: `Dispatched via Order Booking (Stock adjusted)`,
            referenceId: `ORD-${Date.now()}`
          }).catch(() => {});
        } else {
          // Ad-hoc item from frontend catalogue not yet indexed in MongoDB
          const unitPrice = item.unitPrice || item.price || 0;
          const itemTotal = unitPrice * qty;

          processedItems.push({
            productId: pId || `SKU-${Date.now()}`,
            sku: item.sku || 'SKU-FMCG',
            productName: item.name || item.productName || 'FMCG Product',
            companyName: item.companyName || item.brand || 'Anuj FMCG',
            categoryName: item.categoryName || item.category || 'General',
            quantity: qty,
            price: unitPrice,
            packSize: item.packSize || 'Standard Pack',
            bundleSize: item.bundleSize || '',
            caseSize: item.caseSize || '',
            isPriority: Boolean(item.isPriority),
            total: itemTotal
          });

          grandTotal += itemTotal;
          totalQuantity += qty;
        }
      }
    }

    const { invoiceNumber, orderId } = await getNextInvoiceAndOrderNumber();

    // Normalize customer classification
    let normalizedClassification: 'NORMAL' | 'DAMAGE' | 'EXPIRY' = 'NORMAL';
    if (customerType === 'Damage Customer' || customerType === 'DAMAGE') normalizedClassification = 'DAMAGE';
    if (customerType === 'Expiry Customer' || customerType === 'EXPIRY') normalizedClassification = 'EXPIRY';

    const cleanCustomerName = String(customerName).trim();
    const cleanCustomerMobile = customerMobile && String(customerMobile).trim() ? String(customerMobile).trim() : '';
    const cleanCustomerEmail = customerEmail && String(customerEmail).trim() ? String(customerEmail).trim() : '';

    // Auto-create or Update Customer in Roster (match strictly by shop name so two different customer shops never merge)
    let customerObj = await Customer.findOne({ 
      name: new RegExp(`^${escapeRegex(cleanCustomerName)}$`, 'i')
    });

    let resolvedPaymentMethod = req.body.paymentMethod || req.body.paymentMode || 'Cash';
    if (resolvedPaymentMethod.toUpperCase().includes('CREDIT') || resolvedPaymentMethod.toUpperCase().includes('NET')) {
      resolvedPaymentMethod = 'Credit';
    } else if (resolvedPaymentMethod.toUpperCase().includes('SPECIAL')) {
      resolvedPaymentMethod = 'Cash'; // Special Scheme removed
    }

    if (!customerObj) {
      const custCount = await Customer.countDocuments();
      customerObj = new Customer({
        customerId: `AE-CUST-${String(custCount + 101).padStart(3, '0')}`,
        name: cleanCustomerName,
        phone: cleanCustomerMobile,
        email: cleanCustomerEmail,
        address: customerAddress ? String(customerAddress).trim() : '',
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
      if (cleanCustomerMobile) customerObj.phone = cleanCustomerMobile;
      if (cleanCustomerEmail) customerObj.email = cleanCustomerEmail;
      await customerObj.save();
    }

    // Buyer mobile must remain blank if not provided - never fake or copied from salesman/admin
    const cleanMobile = cleanCustomerMobile;
    const cleanEmail = cleanCustomerEmail;

    const order = new Order({
      orderId,
      invoiceNumber,
      customerName: cleanCustomerName,
      customerClassification: normalizedClassification,
      customerId: customerObj.customerId,
      salesmanId: resolvedSalesmanId,
      salesmanName: resolvedSalesmanName,
      shopOwnerName: resolvedShopOwnerName,
      shopOwnerArea: resolvedShopOwnerArea,
      shopRoute: resolvedShopRoute,
      description: resolvedDescription,
      generatedByRole: resolvedGeneratedByRole,
      generatedByName: resolvedGeneratedByName,
      generatedById: resolvedGeneratedById,
      customerDetails: {
        mobile: cleanMobile,
        email: cleanEmail,
        address: customerAddress || customerObj.address || '',
        city: customerCity || customerObj.city || 'Kanpur',
        state: customerState || customerObj.state || 'Uttar Pradesh'
      },
      shippingAddress: {
        street: customerAddress || customerObj.address || '',
        city: customerCity || customerObj.city || 'Kanpur',
        state: customerState || customerObj.state || 'Uttar Pradesh',
        pincode: ''
      },
      items: processedItems,
      totalQuantity,
      totalAmount: grandTotal,
      paymentMethod: resolvedPaymentMethod,
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
      salesmanId: resolvedSalesmanId,
      salesmanName: resolvedSalesmanName,
      shopOwnerName: resolvedShopOwnerName,
      shopOwnerArea: resolvedShopOwnerArea,
      shopRoute: resolvedShopRoute,
      description: resolvedDescription,
      generatedByRole: resolvedGeneratedByRole,
      generatedByName: resolvedGeneratedByName,
      generatedById: resolvedGeneratedById,
      customerId: customerObj.customerId,
      customerName: order.customerName,
      customerClassification: normalizedClassification,
      customerMobile: cleanMobile,
      customerEmail: cleanEmail,
      customerAddress: customerAddress || customerObj.address || '',
      customerCity: customerCity || customerObj.city || 'Kanpur',
      customerState: customerState || customerObj.state || 'Uttar Pradesh',
      items: processedItems.map(i => ({
        id: i.productId,
        productId: i.productId,
        name: i.productName,
        productName: i.productName,
        companyName: i.companyName || '',
        categoryName: i.categoryName || '',
        sku: i.sku,
        qty: i.quantity,
        quantity: i.quantity,
        price: i.price,
        unitPrice: i.price,
        packSize: i.packSize,
        bundleSize: i.bundleSize,
        caseSize: i.caseSize,
        isPriority: Boolean(i.isPriority),
        total: i.total
      })),
      expiredItems: expiredItems || [],
      returnItems: returnItems || [],
      hasUrgentItems: processedItems.some(i => i.isPriority),
      hasExpiredItems: Boolean(expiredItems && expiredItems.length > 0),
      hasReturnItems: Boolean(returnItems && returnItems.length > 0),
      paymentMethod: resolvedPaymentMethod,
      subtotal: grandTotal,
      grandTotal,
      paymentStatus: 'OFFLINE',
      collectionStatus: 'PENDING',
      issuedAt: new Date()
    });
    await invoice.save();


    // Asynchronously dispatch Order Invoice Email via Nodemailer (Gmail / SMTP)
    sendOrderInvoiceEmail({
      orderId,
      invoiceNumber,
      customerName: order.customerName,
      shopOwnerName: resolvedShopOwnerName,
      customerMobile: cleanMobile,
      customerAddress: customerAddress || '',
      customerCity: customerCity || 'Kanpur',
      customerState: customerState || 'Uttar Pradesh',
      totalQuantity,
      totalAmount: grandTotal,
      items: processedItems,
      date: new Date().toISOString().split('T')[0]
    }, cleanEmail).catch(err => {
      console.warn('[OrderController] Email dispatch notification caught:', err?.message || err);
    });

    return res.status(201).json({
      success: true,
      data: {
        order: {
          _id: String(order._id),
          id: invoiceNumber,
          invoiceNumber,
          orderId,
          date: new Date().toISOString().split('T')[0],
          timestamp: order.createdAt,
          customerId: customerObj.customerId,
          customerName: order.customerName,
          customerMobile: cleanMobile,
          customerEmail: cleanEmail,
          customerAddress: customerAddress || '',
          customerCity: customerCity || 'Kanpur',
          customerState: customerState || 'Uttar Pradesh',
          customerType: customerType || 'Normal Customer',
          salesmanId: order.salesmanId,
          salesmanName: order.salesmanName,
          salesmanPhone: salesmanPhone || '',
          shopOwnerName: resolvedShopOwnerName,
          shopOwnerArea: resolvedShopOwnerArea,
          shopRoute: resolvedShopRoute,
          description: resolvedDescription,
          generatedByRole: resolvedGeneratedByRole,
          generatedByName: resolvedGeneratedByName,
          generatedById: resolvedGeneratedById,
          orderType: 'Offline Collection',
          paymentMethod: resolvedPaymentMethod,
          paymentMode: resolvedPaymentMethod,
          collectionStatus: 'Pending',
          hasUrgentItems: processedItems.some(i => i.isPriority),
          isPriority: processedItems.some(i => i.isPriority),
          items: processedItems.map(i => ({
            id: i.productId,
            productId: i.productId,
            name: i.productName,
            productName: i.productName,
            companyName: i.companyName || '',
            categoryName: i.categoryName || '',
            sku: i.sku,
            qty: i.quantity,
            quantity: i.quantity,
            price: i.price,
            unitPrice: i.price,
            packSize: i.packSize,
            bundleSize: i.bundleSize,
            caseSize: i.caseSize,
            isPriority: Boolean(i.isPriority),
            total: i.total
          })),
          expiredItems: expiredItems || [],
          returnItems: returnItems || [],
          hasExpiredItems: Boolean(expiredItems && expiredItems.length > 0),
          hasReturnItems: Boolean(returnItems && returnItems.length > 0),
          totalQuantity,
          subtotal: grandTotal,
          grandTotal,
          totalAmount: grandTotal,
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
      // Salesman can only query their own orders (case-insensitive regex match)
      const userSalesmanId = req.user.salesmanId || req.user.id;
      filter.salesmanId = { $regex: new RegExp(`^${escapeRegex(String(userSalesmanId).trim())}$`, 'i') };
    } else if (req.user.role === 'USER' || req.user.role === 'CUSTOMER') {
      // Normal customer can only see their own customer orders
      filter.$or = [
        { customerName: req.user.name },
        { customerId: req.user.customerId },
        { 'customerDetails.email': req.user.email },
        { 'customerDetails.mobile': req.user.mobile || req.user.email },
        { 'shippingAddress.street': req.user.email }
      ];
    } else if (req.user.role === 'ADMIN') {
      // Admin can view all or filter by specific salesman
      if (salesmanId) {
        filter.salesmanId = { $regex: new RegExp(`^${escapeRegex(String(salesmanId).trim())}$`, 'i') };
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

    const formatted = orders.map((o: any) => {
      const mob = o.customerDetails?.mobile || o.customerMobile || '';
      const addr = o.customerDetails?.address || o.shippingAddress?.street || o.customerAddress || '';
      const cCity = o.customerDetails?.city || o.shippingAddress?.city || o.customerCity || 'Kanpur';
      const cState = o.customerDetails?.state || o.shippingAddress?.state || o.customerState || 'Uttar Pradesh';
      const cEmail = o.customerDetails?.email || o.customerEmail || '';
      const hasUrgent = Boolean(o.hasUrgentItems || (Array.isArray(o.items) && o.items.some((i: any) => i.isPriority)));

      let payMethod = o.paymentMethod || o.paymentMode || 'Cash';
      if (payMethod.toUpperCase().includes('NET') || payMethod.toUpperCase().includes('CREDIT')) {
        payMethod = 'Credit';
      } else if (payMethod.toUpperCase().includes('SPECIAL')) {
        payMethod = 'Cash'; // Special Scheme removed
      }

      return {
        _id: String(o._id),
        id: o.invoiceNumber || o.orderId,
        orderId: o.orderId,
        invoiceNumber: o.invoiceNumber || o.orderId,
        date: new Date(o.createdAt).toISOString().split('T')[0],
        timestamp: o.createdAt,
        customerId: o.customerId || '',
        customerName: o.customerName,
        customerMobile: mob,
        customerEmail: cEmail,
        customerAddress: addr,
        customerCity: cCity,
        customerState: cState,
        customerType: o.customerClassification ? `${o.customerClassification.charAt(0) + o.customerClassification.slice(1).toLowerCase()} Customer` : 'Normal Customer',
        customerClassification: o.customerClassification || 'NORMAL',
        salesmanId: o.salesmanId,
        salesmanName: o.salesmanName,
        shopOwnerName: o.shopOwnerName || '',
        shopOwnerArea: o.shopOwnerArea || '',
        shopRoute: o.shopRoute || '',
        description: o.description || '',
        generatedByRole: o.generatedByRole || '',
        generatedByName: o.generatedByName || '',
        generatedById: o.generatedById || '',
        orderType: o.orderType || 'Offline Collection',
        paymentMethod: payMethod,
        paymentMode: payMethod,
        paymentStatus: o.paymentStatus || 'OFFLINE',
        collectionStatus: o.collectionStatus === 'PENDING' ? 'Pending' : 'Collected',
        status: o.status,
        hasUrgentItems: hasUrgent,
        isPriority: hasUrgent,
        expiredItems: o.expiredItems || [],
        returnItems: o.returnItems || [],
        hasExpiredItems: Boolean(o.expiredItems && o.expiredItems.length > 0),
        hasReturnItems: Boolean(o.returnItems && o.returnItems.length > 0),
        items: (o.items || []).map((i: any) => ({
          id: i.productId,
          productId: i.productId,
          name: i.productName,
          productName: i.productName,
          companyName: i.companyName || '',
          categoryName: i.categoryName || '',
          sku: i.sku,
          qty: i.quantity,
          quantity: i.quantity,
          price: i.price,
          unitPrice: i.price,
          packSize: i.packSize || '1 Unit',
          bundleSize: i.bundleSize || '',
          caseSize: i.caseSize || '',
          isPriority: Boolean(i.isPriority),
          total: i.total || (i.price * i.quantity)
        })),
        totalQuantity: o.totalQuantity,
        subtotal: o.totalAmount,
        grandTotal: o.totalAmount,
        totalAmount: o.totalAmount,
        isRead: Boolean(o.isRead)
      };
    });


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

export const toggleOrderRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const idStr = String(req.params.id);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
    const order = await Order.findOne({
      $or: [{ orderId: idStr }, { invoiceNumber: idStr }, { _id: isObjectId ? idStr : null }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const nowRead = !order.isRead;
    order.isRead = nowRead;
    order.readAt = nowRead ? new Date() : undefined;
    order.readBy = nowRead ? (req.user.name || req.user.id || 'Admin') : '';
    await order.save();

    return res.json({
      success: true,
      data: { isRead: order.isRead, readAt: order.readAt, readBy: order.readBy },
      message: `Order marked as ${nowRead ? 'Read' : 'Unread'}`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const cleanRole = String(req.user?.role || '').toUpperCase();
    if (!req.user || (cleanRole !== 'ADMIN' && req.user.id !== 'ADMIN_ENTERPRISE')) {
      return res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
    }
    const idStr = String(req.params.id || '').trim();
    if (!idStr || idStr === 'undefined' || idStr === 'null') {
      return res.status(400).json({ success: false, message: 'Valid order ID is required', code: 'INVALID_ID' });
    }
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
    const escaped = escapeRegex(idStr);
    const order = await Order.findOne({
      $or: [
        ...(isObjectId ? [{ _id: idStr }] : []),
        { orderId: idStr },
        { orderId: { $regex: new RegExp(`^${escaped}$`, 'i') } },
        { invoiceNumber: idStr },
        { invoiceNumber: { $regex: new RegExp(`^${escaped}$`, 'i') } }
      ]
    });

    if (!order) {
      // Check if matching invoice exists and delete it
      const inv = await Invoice.findOneAndDelete({
        $or: [
          ...(isObjectId ? [{ _id: idStr }] : []),
          { invoiceNumber: idStr },
          { invoiceNumber: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { orderId: idStr },
          { orderId: { $regex: new RegExp(`^${escaped}$`, 'i') } }
        ]
      });

      if (inv) {
        return res.json({ 
          success: true, 
          message: `Invoice ${idStr} and associated records cleared permanently` 
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Order not found in database',
        code: 'ORDER_NOT_FOUND'
      });
    }

    // Restore stock if order was not already cancelled
    if (order.status !== 'CANCELLED' && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.productId || item.sku) {
          await Product.updateOne(
            { $or: [{ productId: item.productId }, { sku: item.sku }] },
            { $inc: { stock: item.quantity || 1 } }
          ).catch(() => {});
        }
      }
    }

    // Permanently remove any linked invoice from MongoDB Invoice collection
    const invoiceFilters: any[] = [];
    if (order.invoiceNumber) {
      const invEsc = escapeRegex(order.invoiceNumber);
      invoiceFilters.push(
        { invoiceNumber: order.invoiceNumber },
        { invoiceNumber: { $regex: new RegExp(`^${invEsc}$`, 'i') } }
      );
    }
    if (order.orderId) {
      const ordEsc = escapeRegex(order.orderId);
      invoiceFilters.push(
        { orderId: order.orderId },
        { orderId: { $regex: new RegExp(`^${ordEsc}$`, 'i') } }
      );
    }
    if (invoiceFilters.length > 0) {
      await Invoice.deleteMany({ $or: invoiceFilters }).catch(() => {});
    }

    // Permanently delete the order document(s) matching _id or orderId
    await Order.deleteMany({
      $or: [
        { _id: order._id },
        ...(order.orderId ? [{ orderId: order.orderId }] : [])
      ]
    });

    await AdminActivity.create({
      action: 'ORDER_DELETED',
      adminId: req.user?.id || 'ADMIN',
      details: `Deleted order ${order.orderId} (Invoice: ${order.invoiceNumber || 'N/A'})`
    }).catch(() => {});

    return res.json({ success: true, message: `Order ${order.orderId} and linked invoice deleted permanently` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleOrderUrgent = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);

    const order = await Order.findOne({
      $or: [{ orderId: idStr }, { invoiceNumber: idStr }, { _id: isObjectId ? idStr : null }]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const newUrgent = req.body.isUrgent !== undefined ? Boolean(req.body.isUrgent) : !order.hasUrgentItems;
    order.hasUrgentItems = newUrgent;
    await order.save();

    // Also synchronize urgency flag with Invoice in MongoDB
    await Invoice.updateOne(
      { $or: [{ orderId: order.orderId }, { invoiceNumber: order.invoiceNumber }] },
      { $set: { hasUrgentItems: newUrgent } }
    );

    return res.json({
      success: true,
      data: {
        orderId: order.orderId,
        invoiceNumber: order.invoiceNumber,
        hasUrgentItems: newUrgent
      },
      message: `Order ${order.orderId} marked as ${newUrgent ? 'Urgent Priority' : 'Normal Priority'}`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


