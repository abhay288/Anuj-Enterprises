import { Request, Response } from 'express';
import { Company } from '../models/Company.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find({ status: 'Active' }).sort({ rank: 1, name: 1 }).lean();
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
    const { name, description, logo, featured, isNew, rank, country } = req.body || {};
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
      isNew: isNew ?? true,
      rank: typeof rank === 'number' ? rank : 999,
      country: country || 'India'
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

export const updateCompanyRanks = async (req: AuthRequest, res: Response) => {
  try {
    const { ranks } = req.body || {};
    if (!Array.isArray(ranks) || ranks.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid ranks array is required' });
    }

    const bulkOps = ranks.map((item: any, idx: number) => {
      const rankNum = typeof item.rank === 'number' ? item.rank : idx + 1;
      const itemId = item.id || item._id;
      const isObjectId = itemId && String(itemId).match(/^[0-9a-fA-F]{24}$/);
      const filter = isObjectId 
        ? { _id: itemId } 
        : { name: new RegExp(`^${String(item.name || '').trim()}$`, 'i') };

      return {
        updateOne: {
          filter,
          update: { $set: { rank: rankNum } },
          upsert: false
        }
      };
    });

    if (bulkOps.length > 0) {
      await Company.bulkWrite(bulkOps);
    }

    const updatedCompanies = await Company.find({ status: 'Active' }).sort({ rank: 1, name: 1 }).lean();
    return res.json({
      success: true,
      data: { companies: updatedCompanies },
      message: 'Company ranks synchronized successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id || '').trim();
    if (!idStr) {
      return res.status(400).json({ success: false, message: 'Company id or name is required' });
    }
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
    const filter = isObjectId
      ? { _id: idStr }
      : { name: new RegExp(`^${idStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    const deleted = await Company.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Company "${idStr}" not found` });
    }
    return res.json({ success: true, message: `Company "${deleted.name}" deleted permanently` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

