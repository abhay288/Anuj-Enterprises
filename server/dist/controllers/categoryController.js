import { Category } from '../models/Category.js';
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ status: 'Active' }).sort({ name: 1 }).lean();
        return res.json({
            success: true,
            data: { categories },
            message: 'Categories fetched successfully'
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const createCategory = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteCategory = async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
