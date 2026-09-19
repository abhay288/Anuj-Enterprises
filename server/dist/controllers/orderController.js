import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { parsePagination, escapeRegex } from '../utils/securityUtils.js';
import { sendOrderInvoiceEmail } from '../utils/emailService.js';
export const createOrder = async (req, res) => {
    try {
        const { items, customerMode, customerName, customerMobile, customerAddress, customerCity, customerState, customerEmail, customerType, shopOwnerName, shopOwnerArea, shopRoute, salesmanId, salesmanName, salesmanPhone, salesmanArea, salesmanRoute, expiredItems, returnItems } = req.body || {};
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
        const resolvedShopOwnerName = shopOwnerName || salesmanName || req.user?.name || 'Shop Owner';
        const resolvedShopOwnerArea = shopOwnerArea || salesmanArea || 'Kanpur Mandi Area';
        const resolvedShopRoute = shopRoute || salesmanRoute || '';
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
            const updatedProduct = await Product.findOneAndUpdate({
                $or: [{ productId: pId }, { sku: item.sku }, { _id: isObjectId ? pId : null }],
                stock: { $gte: qty }
            }, { $inc: { stock: -qty } }, { new: true });
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
                }).catch(() => { });
            }
            else {
                // Fallback: If product exists in database, deduct remaining stock (down to 0) and allow order
                const existingProduct = await Product.findOne({
                    $or: [{ productId: pId }, { sku: item.sku }, { _id: isObjectId ? pId : null }]
                });
                if (existingProduct) {
                    const prevStock = existingProduct.stock || 0;
                    existingProduct.stock = Math.max(0, prevStock - qty);
                    await existingProduct.save().catch(() => { });
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
                    }).catch(() => { });
                }
                else {
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
        const orderCount = await Order.countDocuments();
        const orderId = `ORD-2026-${String(orderCount + 101).padStart(4, '0')}`;
        const invoiceNumber = `AE-INV-2026-${String(orderCount + 101).padStart(4, '0')}`;
        // Normalize customer classification
        let normalizedClassification = 'NORMAL';
        if (customerType === 'Damage Customer' || customerType === 'DAMAGE')
            normalizedClassification = 'DAMAGE';
        if (customerType === 'Expiry Customer' || customerType === 'EXPIRY')
            normalizedClassification = 'EXPIRY';
        // Auto-create or Update Customer in Roster
        let customerObj = await Customer.findOne({
            $or: [
                { phone: customerMobile },
                { name: new RegExp(`^${escapeRegex(customerName)}$`, 'i') }
            ]
        });
        let resolvedPaymentMethod = req.body.paymentMethod || req.body.paymentMode || 'Cash';
        if (resolvedPaymentMethod.toUpperCase().includes('CREDIT') || resolvedPaymentMethod.toUpperCase().includes('NET')) {
            resolvedPaymentMethod = 'Credit';
        }
        else if (resolvedPaymentMethod.toUpperCase().includes('SPECIAL')) {
            resolvedPaymentMethod = 'Cash'; // Special Scheme removed
        }
        if (!customerObj) {
            const custCount = await Customer.countDocuments();
            customerObj = new Customer({
                customerId: `AE-CUST-${String(custCount + 101).padStart(3, '0')}`,
                name: customerName.trim(),
                phone: customerMobile ? String(customerMobile).trim() : '',
                email: customerEmail ? String(customerEmail).trim() : '',
                address: customerAddress ? String(customerAddress).trim() : '',
                city: customerCity || 'Kanpur',
                state: customerState || 'Uttar Pradesh',
                classification: normalizedClassification,
                totalOrders: 1,
                totalSpent: grandTotal,
                lastOrderDate: new Date()
            });
            await customerObj.save();
        }
        else {
            customerObj.totalOrders = (customerObj.totalOrders || 0) + 1;
            customerObj.totalSpent = (customerObj.totalSpent || 0) + grandTotal;
            customerObj.lastOrderDate = new Date();
            customerObj.classification = normalizedClassification;
            if (customerAddress)
                customerObj.address = customerAddress;
            if (customerCity)
                customerObj.city = customerCity;
            if (customerState)
                customerObj.state = customerState;
            if (customerMobile && !customerObj.phone)
                customerObj.phone = customerMobile;
            if (customerEmail && !customerObj.email)
                customerObj.email = customerEmail;
            await customerObj.save();
        }
        const cleanMobile = customerMobile ? String(customerMobile).trim() : (customerObj.phone || '');
        const cleanEmail = customerEmail ? String(customerEmail).trim() : (customerObj.email || '');
        const order = new Order({
            orderId,
            invoiceNumber,
            customerName: customerObj.name,
            customerClassification: normalizedClassification,
            customerId: customerObj.customerId,
            salesmanId: salesmanId || req.user?.salesmanId || 'AE-SM-001',
            salesmanName: resolvedShopOwnerName,
            shopOwnerName: resolvedShopOwnerName,
            shopOwnerArea: resolvedShopOwnerArea,
            shopRoute: resolvedShopRoute,
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
            salesmanId: order.salesmanId,
            salesmanName: order.salesmanName,
            shopOwnerName: resolvedShopOwnerName,
            shopOwnerArea: resolvedShopOwnerArea,
            shopRoute: resolvedShopRoute,
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const getOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        const { salesmanId, search, status } = req.query;
        const filter = {};
        // Horizontal Privilege Access Control:
        if (req.user.role === 'SALESMAN') {
            // Salesman can only query their own orders
            const userSalesmanId = req.user.salesmanId || req.user.id;
            filter.salesmanId = String(userSalesmanId).toUpperCase();
        }
        else if (req.user.role === 'USER' || req.user.role === 'CUSTOMER') {
            // Normal customer can only see their own customer orders
            filter.$or = [
                { customerName: req.user.name },
                { customerId: req.user.customerId },
                { 'customerDetails.email': req.user.email },
                { 'customerDetails.mobile': req.user.mobile || req.user.email },
                { 'shippingAddress.street': req.user.email }
            ];
        }
        else if (req.user.role === 'ADMIN') {
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
        const formatted = orders.map((o) => {
            const mob = o.customerDetails?.mobile || o.customerMobile || '';
            const addr = o.customerDetails?.address || o.shippingAddress?.street || o.customerAddress || '';
            const cCity = o.customerDetails?.city || o.shippingAddress?.city || o.customerCity || 'Kanpur';
            const cState = o.customerDetails?.state || o.shippingAddress?.state || o.customerState || 'Uttar Pradesh';
            const cEmail = o.customerDetails?.email || o.customerEmail || '';
            const hasUrgent = Boolean(o.hasUrgentItems || (Array.isArray(o.items) && o.items.some((i) => i.isPriority)));
            let payMethod = o.paymentMethod || o.paymentMode || 'Cash';
            if (payMethod.toUpperCase().includes('NET') || payMethod.toUpperCase().includes('CREDIT')) {
                payMethod = 'Credit';
            }
            else if (payMethod.toUpperCase().includes('SPECIAL')) {
                payMethod = 'Cash'; // Special Scheme removed
            }
            return {
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
                shopOwnerName: o.shopOwnerName || o.salesmanName || 'Shop Owner',
                shopOwnerArea: o.shopOwnerArea || 'Kanpur Mandi Area',
                shopRoute: o.shopRoute || '',
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
                items: (o.items || []).map((i) => ({
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const updateOrderStatus = async (req, res) => {
    try {
        const idStr = String(req.params.id);
        const { status, collectionStatus } = req.body || {};
        const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
        const order = await Order.findOne({ $or: [{ orderId: idStr }, { invoiceNumber: idStr }, { _id: isObjectId ? idStr : null }] });
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });
        // Stock Restoration Rule: Restock inventory if order status is updated to CANCELLED
        if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
            for (const item of order.items) {
                await Product.updateOne({ $or: [{ productId: item.productId }, { sku: item.sku }] }, { $inc: { stock: item.quantity } });
            }
        }
        if (status)
            order.status = status;
        if (collectionStatus)
            order.collectionStatus = collectionStatus;
        await order.save();
        await AdminActivity.create({
            action: 'ORDER_STATUS_CHANGED',
            adminId: req.user?.id || 'ADMIN',
            details: `Updated order ${order.orderId} status to ${order.status}`
        });
        return res.json({ success: true, data: { order }, message: 'Order status updated' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const toggleOrderRead = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const idStr = String(req.params.id);
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
        const order = await Order.findOne({
            $or: [{ orderId: idStr }, { invoiceNumber: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteOrder = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const idStr = String(req.params.id);
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
        const order = await Order.findOne({
            $or: [{ orderId: idStr }, { invoiceNumber: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });
        // Restore stock if order was not already cancelled
        if (order.status !== 'CANCELLED') {
            for (const item of order.items) {
                await Product.updateOne({ $or: [{ productId: item.productId }, { sku: item.sku }] }, { $inc: { stock: item.quantity } });
            }
        }
        // Remove linked invoice safely (unlink reference, do not cascade-delete)
        if (order.invoiceNumber) {
            await Invoice.updateOne({ invoiceNumber: order.invoiceNumber }, { $set: { orderId: `DELETED-${order.orderId}`, collectionStatus: 'PENDING' } });
        }
        await Order.deleteOne({ _id: order._id });
        await AdminActivity.create({
            action: 'ORDER_DELETED',
            adminId: req.user?.id || 'ADMIN',
            details: `Deleted order ${order.orderId} (Invoice: ${order.invoiceNumber || 'N/A'})`
        });
        return res.json({ success: true, message: `Order ${order.orderId} deleted permanently` });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const toggleOrderUrgent = async (req, res) => {
    try {
        const idStr = String(req.params.id);
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
        const order = await Order.findOne({
            $or: [{ orderId: idStr }, { invoiceNumber: idStr }, { _id: isObjectId ? idStr : null }]
        });
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });
        const newUrgent = req.body.isUrgent !== undefined ? Boolean(req.body.isUrgent) : !order.hasUrgentItems;
        order.hasUrgentItems = newUrgent;
        await order.save();
        // Also synchronize urgency flag with Invoice in MongoDB
        await Invoice.updateOne({ $or: [{ orderId: order.orderId }, { invoiceNumber: order.invoiceNumber }] }, { $set: { hasUrgentItems: newUrgent } });
        return res.json({
            success: true,
            data: {
                orderId: order.orderId,
                invoiceNumber: order.invoiceNumber,
                hasUrgentItems: newUrgent
            },
            message: `Order ${order.orderId} marked as ${newUrgent ? 'Urgent Priority' : 'Normal Priority'}`
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
