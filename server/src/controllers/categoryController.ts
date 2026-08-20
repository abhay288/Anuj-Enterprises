import { Request, Response } from 'express';
import { Category } from '../models/Category.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ status: 'Active' }).sort({ name: 1 }).lean();
    return res.json({
      success: true,
      data: { categories },
      message: 'Categories fetched successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: new RegExp(`^${String(name).trim()}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = new Category({
      name: String(name).trim(),
      description: description || '',
      image: image || ''
    });
    await category.save();

    return res.status(201).json({
      success: true,
      data: { category },
      message: `Category "${name}" created successfully`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    await Category.findOneAndDelete({ $or: [{ _id: isObjectId ? idStr : null }, { name: idStr }] });
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
