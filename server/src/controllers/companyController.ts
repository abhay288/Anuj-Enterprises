import { Request, Response } from 'express';
import { Company } from '../models/Company.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find({ status: 'Active' }).sort({ name: 1 }).lean();
    return res.json({
      success: true,
      data: { companies },
      message: 'Companies fetched successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, logo, featured, isNew } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const existing = await Company.findOne({ name: new RegExp(`^${String(name).trim()}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Company already exists' });
    }

    const company = new Company({
      name: String(name).trim(),
      description: description || '',
      logo: logo || '',
      featured: featured ?? false,
      isNew: isNew ?? true
    });
    await company.save();

    return res.status(201).json({
      success: true,
      data: { company },
      message: `Company "${name}" created successfully`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    await Company.findOneAndDelete({ $or: [{ _id: isObjectId ? idStr : null }, { name: idStr }] });
    return res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
