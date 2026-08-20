import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getStockDashboard = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ status: 'Published' }).lean();

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    const lowStockItems: any[] = [];
    const outOfStockItems: any[] = [];

    for (const p of products) {
      const threshold = p.lowStockThreshold || 20;
      if (p.stock === 0) {
        outOfStock++;
        outOfStockItems.push(p);
      } else if (p.stock <= threshold) {
        lowStock++;
        lowStockItems.push(p);
      } else {
        inStock++;
      }
    }

    return res.json({
      success: true,
      data: {
        totalProducts: products.length,
        inStock,
        lowStock,
        outOfStock,
        lowStockItems,
        outOfStockItems
      },
      message: 'Stock dashboard metrics retrieved successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const restockProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, reason = 'Regular Warehouse Procurement Restock' } = req.body;

    const qtyToAdd = parseInt(String(quantity), 10);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Restock quantity must be a positive integer greater than 0.'
      });
    }

    const idStr = String(id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOne({
      $or: [{ productId: idStr }, { sku: idStr }, { _id: isObjectId ? idStr : null }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.stock;
    const newStock = previousStock + qtyToAdd;

    product.stock = newStock;
    product.updatedBy = req.user?.name || 'ADMIN';
    await product.save();

    // Log Inventory Movement
    const log = new InventoryLog({
      productId: product.productId,
      sku: product.sku,
      productName: product.name,
      changeType: 'STOCK_ADDED',
      quantityChange: qtyToAdd,
      previousStock,
      newStock,
      reason,
      performedBy: req.user?.salesmanId || req.user?.id || 'ADMIN',
      adminName: req.user?.name || 'Managing Director'
    });
    await log.save();

    // Log Admin Activity
    await AdminActivity.create({
      action: 'RESTOCK_PRODUCT',
      adminId: req.user?.id || 'admin',
      adminName: req.user?.name || 'Admin',
      details: `Restocked ${qtyToAdd} units for "${product.name}" (SKU: ${product.sku}). Stock: ${previousStock} -> ${newStock}`
    });

    return res.json({
      success: true,
      data: {
        product,
        log
      },
      message: `Successfully restocked ${qtyToAdd} units for "${product.name}". New stock: ${newStock}`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newStock, reason = 'Physical Inventory Count Audit Adjustment' } = req.body;

    const targetStock = parseInt(String(newStock), 10);
    if (isNaN(targetStock) || targetStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock count cannot be negative. Must be 0 or higher.'
      });
    }

    const idStr = String(id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOne({
      $or: [{ productId: idStr }, { sku: idStr }, { _id: isObjectId ? idStr : null }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.stock;
    const quantityChange = targetStock - previousStock;

    product.stock = targetStock;
    product.updatedBy = req.user?.name || 'ADMIN';
    await product.save();

    // Log Inventory Movement
    const log = new InventoryLog({
      productId: product.productId,
      sku: product.sku,
      productName: product.name,
      changeType: 'MANUAL_ADJUSTMENT',
      quantityChange,
      previousStock,
      newStock: targetStock,
      reason,
      performedBy: req.user?.salesmanId || req.user?.id || 'ADMIN',
      adminName: req.user?.name || 'Managing Director'
    });
    await log.save();

    return res.json({
      success: true,
      data: {
        product,
        log
      },
      message: `Adjusted inventory for "${product.name}". Stock updated: ${previousStock} -> ${targetStock}`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStockThreshold = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { lowStockThreshold } = req.body;

    const threshold = parseInt(String(lowStockThreshold), 10);
    if (isNaN(threshold) || threshold < 1) {
      return res.status(400).json({
        success: false,
        message: 'Low stock threshold must be at least 1 unit.'
      });
    }

    const idStr = String(id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOneAndUpdate(
      { $or: [{ productId: idStr }, { sku: idStr }, { _id: isObjectId ? idStr : null }] },
      { lowStockThreshold: threshold },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({
      success: true,
      data: { product },
      message: `Updated low stock alert threshold to ${threshold} units for "${product.name}"`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkUpdateStock = async (req: AuthRequest, res: Response) => {
  try {
    const { items, reason = 'Bulk Inventory Procurement Update' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required for bulk stock update.'
      });
    }

    // Step 1: Pre-validation of all rows before applying
    const validationErrors: string[] = [];
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      if (!row.sku && !row.productId && !row.id) {
        validationErrors.push(`Row ${i + 1}: Missing SKU or product identifier.`);
      }
      const qty = parseInt(String(row.quantityChange || row.qty || row.stock), 10);
      if (isNaN(qty)) {
        validationErrors.push(`Row ${i + 1} (${row.sku || 'SKU'}): Invalid quantity value.`);
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed on bulk stock rows.',
        errors: validationErrors
      });
    }

    // Step 2: Apply updates atomically
    const results = [];
    for (const row of items) {
      const identifier = row.sku || row.productId || row.id;
      const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
      const product = await Product.findOne({
        $or: [{ productId: identifier }, { sku: identifier }, { _id: isObjectId ? identifier : null }]
      });

      if (product) {
        const previousStock = product.stock;
        let newStock = previousStock;
        let changeQty = 0;

        if (row.type === 'SET' || row.mode === 'SET') {
          newStock = Math.max(0, parseInt(String(row.stock || row.quantity), 10) || 0);
          changeQty = newStock - previousStock;
        } else {
          // Default: Additive increment
          changeQty = parseInt(String(row.quantityChange || row.qty || row.quantity || 0), 10) || 0;
          newStock = Math.max(0, previousStock + changeQty);
        }

        product.stock = newStock;
        if (row.lowStockThreshold && parseInt(String(row.lowStockThreshold), 10) > 0) {
          product.lowStockThreshold = parseInt(String(row.lowStockThreshold), 10);
        }
        await product.save();

        const log = await InventoryLog.create({
          productId: product.productId,
          sku: product.sku,
          productName: product.name,
          changeType: changeQty >= 0 ? 'STOCK_ADDED' : 'MANUAL_ADJUSTMENT',
          quantityChange: changeQty,
          previousStock,
          newStock,
          reason: row.reason || reason,
          performedBy: req.user?.salesmanId || req.user?.id || 'ADMIN',
          adminName: req.user?.name || 'Managing Director'
        });

        results.push({
          sku: product.sku,
          name: product.name,
          previousStock,
          newStock,
          changeQty
        });
      }
    }

    return res.json({
      success: true,
      data: { updatedCount: results.length, results },
      message: `Successfully updated inventory for ${results.length} products.`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInventoryLogs = async (req: Request, res: Response) => {
  try {
    const { sku, productId, changeType, page = 1, limit = 50 } = req.query;
    const filter: any = {};

    if (sku) filter.sku = new RegExp(`^${sku}$`, 'i');
    if (productId) filter.productId = productId;
    if (changeType) filter.changeType = changeType;

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      InventoryLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      InventoryLog.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      message: 'Inventory audit logs retrieved successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
