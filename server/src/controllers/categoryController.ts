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

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id || '').trim();
    const { name, description, image, status } = req.body || {};
    if (!idStr) {
      return res.status(400).json({ success: false, message: 'Category id or name is required' });
    }
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
    const filter = isObjectId
      ? { _id: idStr }
      : { name: new RegExp(`^${idStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };

    const category = await Category.findOne(filter);
    if (!category) {
      return res.status(404).json({ success: false, message: `Category "${idStr}" not found` });
    }

    const oldName = category.name;
    if (name && String(name).trim() && String(name).trim() !== oldName) {
      const trimmed = String(name).trim();
      const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        name: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Category "${trimmed}" already exists` });
      }
      category.name = trimmed;

      // Update categoryName in products collection
      const { Product } = await import('../models/Product.js');
      await Product.updateMany(
        { categoryName: new RegExp(`^${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { $set: { categoryName: trimmed } }
      );
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (status !== undefined) category.status = status;

    await category.save();

    return res.json({
      success: true,
      data: { category },
      message: `Category updated successfully`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id || '').trim();
    if (!idStr) {
      return res.status(400).json({ success: false, message: 'Category id or name is required' });
    }
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idStr);
    const filter = isObjectId
      ? { _id: idStr }
      : { name: new RegExp(`^${idStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    const deleted = await Category.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Category "${idStr}" not found` });
    }
    return res.json({ success: true, message: `Category "${deleted.name}" deleted permanently` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



