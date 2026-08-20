import { Request, Response } from 'express';
import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, salesmanId } = req.query;
    const filter: any = {};

    // RBAC check: Salesman only sees their assigned/created customers unless Admin
    if (req.user?.role === 'SALESMAN' && req.user.salesmanId) {
      filter.createdBy = req.user.salesmanId.toUpperCase();
    } else if (salesmanId) {
      filter.createdBy = String(salesmanId).toUpperCase();
    }

    if (search) {
      const q = String(search).trim();
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { mobile: new RegExp(q, 'i') },
        { customerId: new RegExp(q, 'i') },
        { city: new RegExp(q, 'i') }
      ];
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      data: { customers },
      message: 'Customers retrieved successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const customer = await Customer.findOne({ $or: [{ customerId: idStr }, { _id: isObjectId ? idStr : null }] });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    return res.json({ success: true, data: { customer } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerOrderHistory = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const customer = await Customer.findOne({ $or: [{ customerId: idStr }, { _id: isObjectId ? idStr : null }] });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // RBAC check: Salesman can only view history of authorized customer
    if (req.user?.role === 'SALESMAN' && req.user.salesmanId && customer.createdBy !== req.user.salesmanId.toUpperCase()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized access to customer data' });
    }

    const orders = await Order.find({
      $or: [{ customerId: customer.customerId }, { customerName: customer.name }]
    }).sort({ createdAt: -1 }).lean();

    // Aggregate frequently ordered products
    const productFrequencyMap: Record<string, { name: string; sku: string; totalQty: number; orderCount: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.sku || item.productId;
        if (!productFrequencyMap[key]) {
          productFrequencyMap[key] = {
            name: item.productName,
            sku: item.sku,
            totalQty: 0,
            orderCount: 0
          };
        }
        productFrequencyMap[key].totalQty += item.quantity;
        productFrequencyMap[key].orderCount += 1;
      }
    }

    const frequentlyOrdered = Object.values(productFrequencyMap).sort((a, b) => b.totalQty - a.totalQty).slice(0, 5);

    return res.json({
      success: true,
      data: {
        customer,
        orders,
        totalOrders: orders.length,
        lastOrderDate: orders.length > 0 ? new Date(orders[0].createdAt).toISOString().split('T')[0] : null,
        frequentlyOrdered
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, mobile, email, address, city, state, classification, customerMode } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    const customer = new Customer({
      customerId: `CUST-${Date.now()}`,
      name: String(name).trim(),
      mobile: mobile || '',
      email: email || '',
      address: address || '',
      city: city || '',
      state: state || '',
      classification: classification || 'NORMAL',
      customerMode: customerMode === 'FULL' ? 'FULL' : 'QUICK',
      createdBy: req.user?.salesmanId?.toUpperCase() || 'AE-SM-001'
    });

    await customer.save();

    return res.status(201).json({
      success: true,
      data: { customer },
      message: `Customer ${name} registered successfully`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
