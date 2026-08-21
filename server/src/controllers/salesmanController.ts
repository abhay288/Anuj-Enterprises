import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Salesman } from '../models/Salesman.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getSalesmen = async (req: Request, res: Response) => {
  try {
    const salesmen = await Salesman.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
    const formatted = salesmen.map((s: any) => ({
      id: s.salesmanId,
      _id: s._id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      status: s.status,
      region: s.region || 'West India (Mumbai HQ)',
      salesVolume: s.totalPurchase || '0 Units',
      ordersCount: s.totalOrders || 0,
      lastOrder: s.lastOrderDate || 'None'
    }));

    return res.json({
      success: true,
      data: { salesmen: formatted },
      message: 'Salesmen roster retrieved'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalesmanById = async (req: Request, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const salesman = await Salesman.findOne({ $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }] }).select('-passwordHash');

    if (!salesman) {
      return res.status(404).json({ success: false, message: 'Salesman not found' });
    }

    return res.json({ success: true, data: { salesman } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSalesman = async (req: AuthRequest, res: Response) => {
  try {
    const { id, salesmanId, name, email, phone, region } = req.body || {};
    const finalId = (salesmanId || id || `AE-SM-00${Date.now().toString().slice(-2)}`).toUpperCase();

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required' });
    }

    const existing = await Salesman.findOne({ $or: [{ salesmanId: finalId }, { email: String(email).toLowerCase() }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Salesman with this ID or Email already exists' });
    }

    const defaultPassword = 'Sales@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const salesman = new Salesman({
      salesmanId: finalId,
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: String(phone).trim(),
      passwordHash,
      region: region || 'West India (Mumbai HQ)',
      status: 'Active'
    });

    await salesman.save();

    await AdminActivity.create({
      action: 'SALESMAN_CREATED',
      adminId: req.user?.id || 'ADMIN',
      details: `Added new salesman ${name} (ID: ${finalId})`
    });

    return res.status(201).json({
      success: true,
      data: {
        salesman: {
          id: salesman.salesmanId,
          name: salesman.name,
          email: salesman.email,
          phone: salesman.phone,
          status: salesman.status,
          region: salesman.region
        }
      },
      message: `Salesman ${name} created successfully`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSalesman = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const { name, email, phone, region } = req.body || {};
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);

    const salesman = await Salesman.findOne({ $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }] });
    if (!salesman) return res.status(404).json({ success: false, message: 'Salesman not found' });

    if (name) salesman.name = name;
    if (email) salesman.email = String(email).toLowerCase();
    if (phone) salesman.phone = phone;
    if (region) salesman.region = region;

    await salesman.save();

    return res.json({ success: true, data: { salesman }, message: 'Salesman updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleSalesmanStatus = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const salesman = await Salesman.findOne({ $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }] });
    if (!salesman) return res.status(404).json({ success: false, message: 'Salesman not found' });

    salesman.status = salesman.status === 'Active' ? 'Paused' : 'Active';
    await salesman.save();

    await AdminActivity.create({
      action: 'SALESMAN_DISABLED',
      adminId: req.user?.id || 'ADMIN',
      details: `Toggled status for ${salesman.name} to ${salesman.status}`
    });

    return res.json({ success: true, data: { status: salesman.status }, message: `Salesman status set to ${salesman.status}` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSalesman = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const salesman = await Salesman.findOneAndDelete({ $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }] });
    if (!salesman) return res.status(404).json({ success: false, message: 'Salesman not found' });

    await AdminActivity.create({
      action: 'SALESMAN_DELETED',
      adminId: req.user?.id || 'ADMIN',
      details: `Permanently deleted salesman ${salesman.name} (${salesman.salesmanId})`
    });

    return res.json({ success: true, message: `Salesman ${salesman.salesmanId} permanently deleted` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const salesman = await Salesman.findOne({ $or: [{ salesmanId: idStr.toUpperCase() }, { _id: isObjectId ? idStr : null }] });
    if (!salesman) return res.status(404).json({ success: false, message: 'Salesman not found' });

    const newPassword = req.body?.password || 'Sales@123';
    salesman.passwordHash = await bcrypt.hash(newPassword, 10);
    await salesman.save();

    return res.json({
      success: true,
      message: `Password for Salesman ${salesman.salesmanId} securely reset to ${newPassword}`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
