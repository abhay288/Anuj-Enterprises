import { Request, Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { escapeRegex, sanitizeCsvFormula } from '../utils/securityUtils.js';
import { sendRealtimeEvent } from '../utils/realtime.js';

export const syncInitialDataFile = async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const targetPath = path.resolve(__dirname, '../../../src/data/initialData.js');
    if (!fs.existsSync(targetPath)) return;

    const allProducts = await Product.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
    if (!allProducts || allProducts.length === 0) return;

    const formatted = allProducts.map((p: any, idx: number) => ({
      id: p.productId || p._id.toString(),
      _id: p._id.toString(),
      productId: p.productId,
      name: p.name,
      brand: p.companyName,
      company: p.companyName,
      category: p.categoryName,
      sku: p.sku,
      hsn: p.hsn || '19053100',
      price: p.price,
      mrp: p.mrp || Math.round(p.price * 1.2),
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || 20,
      unitType: p.unitType || 'Piece',
      unitQuantity: p.unitQuantity || '',
      packSize: p.packSize || '',
      bundleSize: p.bundleSize || '',
      malaSize: p.malaSize || '',
      boriSize: p.boriSize || '',
      caseSize: p.caseSize || '',
      cartonSize: p.cartonSize || '',
      customPackaging: p.customPackaging || '',
      isFeatured: Boolean(p.featured),
      isNew: Boolean(p.newProduct),
      isNrp: Boolean(p.isNrp),
      status: p.status || 'Published',
      sortOrder: typeof p.sortOrder === 'number' && p.sortOrder > 0 ? p.sortOrder : (idx + 1),
      image: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      images: p.images ? p.images.map((i: any) => i.url) : [],
      gallery: p.images ? p.images.map((i: any) => i.url) : [],
      description: p.description || ''
    }));

    let content = fs.readFileSync(targetPath, 'utf8');
    content = content.replace(
      /export const INITIAL_PRODUCTS = \[[\s\S]*?\];/,
      'export const INITIAL_PRODUCTS = ' + JSON.stringify(formatted, null, 2) + ';'
    );
    fs.writeFileSync(targetPath, content, 'utf8');
  } catch (err: any) {
    console.warn('[SyncNotice] initialData.js sync:', err.message);
  }
};

export const buildProductLookupQuery = (idParam: string, extra?: any) => {
  const cleanId = String(idParam || '').trim();
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId);
  const orConditions: any[] = [];

  if (cleanId) {
    orConditions.push({ productId: cleanId });
    orConditions.push({ sku: cleanId });
    orConditions.push({ sku: cleanId.toUpperCase() });
    if (isObjectId) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(cleanId) });
    }
  }

  if (extra && typeof extra === 'object') {
    if (extra.sku) {
      const s = String(extra.sku).trim();
      orConditions.push({ sku: s });
      orConditions.push({ sku: s.toUpperCase() });
    }
    if (extra.productId) {
      orConditions.push({ productId: String(extra.productId).trim() });
    }
    if (extra.id) {
      const idStr = String(extra.id).trim();
      orConditions.push({ productId: idStr });
      if (/^[0-9a-fA-F]{24}$/.test(idStr)) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(idStr) });
      }
    }
    if (extra._id && /^[0-9a-fA-F]{24}$/.test(String(extra._id).trim())) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(String(extra._id).trim()) });
    }
    if (extra.name) {
      orConditions.push({ name: String(extra.name).trim() });
    }
  }

  return orConditions.length > 0 ? { $or: orConditions } : { productId: cleanId };
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      company, 
      category, 
      search, 
      featured, 
      newProduct, 
      status, 
      page = 1, 
      limit = 50, 
      sort = 'createdAt' 
    } = req.query;

    const queryFilter: any = {};

    if (company && company !== 'All') {
      queryFilter.companyName = new RegExp(`^${escapeRegex(String(company))}$`, 'i');
    }

    if (category && category !== 'All') {
      queryFilter.categoryName = new RegExp(`^${escapeRegex(String(category))}$`, 'i');
    }

    if (featured === 'true') {
      queryFilter.featured = true;
    }

    if (newProduct === 'true') {
      queryFilter.newProduct = true;
    }

    const cleanStatus = status ? String(status).trim() : '';
    if (cleanStatus && cleanStatus.toLowerCase() !== 'all') {
      queryFilter.status = cleanStatus;
    } else if (!cleanStatus) {
      // Default to Published unless caller explicitly asks for all or is an Admin
      const reqRole = (req as AuthRequest).user?.role;
      if (reqRole !== 'ADMIN') {
        queryFilter.status = 'Published';
      }
    }

    if (search) {
      const q = String(search).trim();
      const tokens = q.split(/\s+/).filter(Boolean);
      if (tokens.length > 1) {
        // Multi-token matching: all tokens must match (escaped)
        queryFilter.$and = tokens.map(token => {
          const escapedToken = escapeRegex(token);
          return {
            $or: [
              { name: new RegExp(escapedToken, 'i') },
              { sku: new RegExp(escapedToken, 'i') },
              { companyName: new RegExp(escapedToken, 'i') },
              { categoryName: new RegExp(escapedToken, 'i') },
              { description: new RegExp(escapedToken, 'i') }
            ]
          };
        });
      } else {
        const escapedQ = escapeRegex(q);
        queryFilter.$or = [
          { name: new RegExp(escapedQ, 'i') },
          { sku: new RegExp(escapedQ, 'i') },
          { companyName: new RegExp(escapedQ, 'i') },
          { categoryName: new RegExp(escapedQ, 'i') },
          { description: new RegExp(escapedQ, 'i') }
        ];
      }
    }

    // Filter out blacklisted/permanently deleted products
    const db = mongoose.connection.db;
    if (db) {
      const deletedDocs = await db.collection('deleted_products').find({}).toArray().catch(() => []);
      if (deletedDocs && deletedDocs.length > 0) {
        const deletedSkus = deletedDocs.map((d: any) => String(d.sku || '').toUpperCase()).filter(Boolean);
        const deletedIds = deletedDocs.map((d: any) => String(d.productId || '')).filter(Boolean);
        if (deletedSkus.length > 0) {
          queryFilter.sku = { ...(queryFilter.sku || {}), $nin: deletedSkus };
        }
        if (deletedIds.length > 0) {
          queryFilter.productId = { ...(queryFilter.productId || {}), $nin: deletedIds };
        }
      }
    }

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.min(5000, Math.max(1, parseInt(String(limit)) || 50));
    const skip = (pageNum - 1) * limitNum;

    const sortOption = String(sort || '').trim();
    let sortObj: any = { sortOrder: 1, createdAt: -1 };
    if (sortOption === 'sortOrder' || !sortOption) {
      sortObj = { sortOrder: 1, createdAt: -1 };
    } else if (sortOption && sortOption !== 'createdAt') {
      sortObj = { [sortOption]: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(queryFilter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(queryFilter)
    ]);

    const formatted = products.map((p: any, idx: number) => ({
      id: p.productId || p._id.toString(),
      _id: p._id,
      productId: p.productId,
      name: p.name,
      brand: p.companyName,
      company: p.companyName,
      category: p.categoryName,
      sku: p.sku,
      hsn: p.hsn || '19053100',
      price: p.price,
      mrp: p.mrp || Math.round(p.price * 1.2),
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || 20,
      unitType: p.unitType || 'Piece',
      unitQuantity: p.unitQuantity || '',
      packSize: p.packSize || '',
      bundleSize: p.bundleSize || '',
      malaSize: p.malaSize || '',
      boriSize: p.boriSize || '',
      caseSize: p.caseSize || '',
      cartonSize: p.cartonSize || '',
      customPackaging: p.customPackaging || '',
      isFeatured: p.featured,
      isNew: p.newProduct,
      isNrp: p.isNrp || false,
      status: p.status,
      sortOrder: typeof p.sortOrder === 'number' && p.sortOrder > 0 ? p.sortOrder : (skip + idx + 1),
      image: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      gallery: p.images ? p.images.map((img: any) => img.url) : [],
      description: p.description
    }));

    return res.json({
      success: true,
      data: {
        products: formatted,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      message: 'Products retrieved successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products',
      code: 'SERVER_ERROR'
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const idStr = String(req.params.id || '').trim();
    const query = buildProductLookupQuery(idStr);
    const product = await Product.findOne(query).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with ID ${idStr}`,
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      data: {
        product: {
          id: product.productId || product._id.toString(),
          name: product.name,
          brand: product.companyName,
          category: product.categoryName,
          sku: product.sku,
          hsn: product.hsn || '19053100',
          price: product.price,
          mrp: product.mrp || Math.round(product.price * 1.2),
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold || 20,
          unitType: product.unitType || 'Piece',
          unitQuantity: product.unitQuantity || '',
          packSize: product.packSize || '',
          bundleSize: product.bundleSize || '',
          malaSize: product.malaSize || '',
          boriSize: product.boriSize || '',
          caseSize: product.caseSize || '',
          cartonSize: product.cartonSize || '',
          customPackaging: product.customPackaging || '',
          isFeatured: product.featured,
          isNew: product.newProduct,
          isNrp: product.isNrp || false,
          status: product.status,
          sortOrder: product.sortOrder || 0,
          image: product.images && product.images.length > 0 ? product.images[0].url : '',
          gallery: product.images ? product.images.map((i: any) => i.url) : [],
          description: product.description
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, brand, company, category, sku, price, mrp, stock, 
      lowStockThreshold, unitType, unitQuantity, packSize, bundleSize, 
      malaSize, boriSize, caseSize, cartonSize, customPackaging, 
      hsn, isNrp, description, image, images, gallery, isFeatured, isNew, status 
    } = req.body || {};

    if (!name || !sku || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU, and Price are required fields',
        code: 'VALIDATION_ERROR'
      });
    }

    const existingSKU = await Product.findOne({ sku: String(sku).toUpperCase() });
    if (existingSKU) {
      return res.status(400).json({
        success: false,
        message: `Product with SKU ${sku} already exists`,
        code: 'DUPLICATE_SKU'
      });
    }

    let finalImages = [];
    const incomingImgs = (Array.isArray(images) && images.length > 0 ? images : (Array.isArray(gallery) && gallery.length > 0 ? gallery : (image ? [image] : []))).filter(Boolean);
    if (incomingImgs.length > 0) {
      finalImages = incomingImgs.slice(0, 3).map((url: string, idx: number) => ({
        url,
        isPrimary: idx === 0,
        whiteBackground: true
      }));
    } else {
      finalImages = [{
        url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        whiteBackground: true
      }];
    }

    const totalProds = await Product.countDocuments();
    const assignedSortOrder = (req.body?.sortOrder !== undefined && Number(req.body.sortOrder) > 0)
      ? Number(req.body.sortOrder)
      : totalProds + 1;

    const newProdId = `prod-ae-${Date.now()}`;
    const product = new Product({
      productId: newProdId,
      sku: String(sku).toUpperCase(),
      name,
      companyName: brand || company || 'Amul',
      categoryName: category || 'Food & Beverages',
      description: description || 'B2B Enterprise Grade Supply Item',
      price: Number(price),
      mrp: Number(mrp || price * 1.2),
      stock: Number(stock ?? 50),
      lowStockThreshold: Number(lowStockThreshold || 20),
      unitType: unitType || 'Piece',
      unitQuantity: unitQuantity || '',
      packSize: packSize || '',
      bundleSize: bundleSize || '',
      malaSize: malaSize || '',
      boriSize: boriSize || '',
      caseSize: caseSize || '',
      cartonSize: cartonSize || '',
      customPackaging: customPackaging || '',
      hsn: hsn || '19053100',
      isNrp: Boolean(isNrp),
      featured: isFeatured ?? true,
      newProduct: isNew ?? true,
      status: status || 'Published',
      sortOrder: assignedSortOrder,
      images: finalImages,
      createdBy: req.user?.id || 'ADMIN'
    });

    await product.save();

    sendRealtimeEvent('SYNC_PRODUCTS', { action: 'CREATED', productId: product.productId });

    await AdminActivity.create({
      action: 'PRODUCT_CREATED',
      adminId: req.user?.id || 'ADMIN',
      details: `Created product "${name}" (SKU: ${sku})`
    });

    return res.status(201).json({
      success: true,
      data: { product },
      message: `Product "${name}" created successfully`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id || '').trim();
    const updates = req.body || {};
    const query = buildProductLookupQuery(idStr);

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (updates.name) product.name = updates.name;
    if (updates.brand || updates.company) product.companyName = updates.brand || updates.company;
    if (updates.category) product.categoryName = updates.category;
    if (updates.sku) product.sku = String(updates.sku).toUpperCase();
    if (updates.price !== undefined) product.price = Number(updates.price);
    if (updates.mrp !== undefined) product.mrp = Number(updates.mrp);
    if (updates.stock !== undefined) product.stock = Number(updates.stock);
    if (updates.lowStockThreshold !== undefined) product.lowStockThreshold = Number(updates.lowStockThreshold);
    if (updates.unitType !== undefined) product.unitType = updates.unitType;
    if (updates.unitQuantity !== undefined) product.unitQuantity = updates.unitQuantity;
    if (updates.packSize !== undefined) product.packSize = updates.packSize;
    if (updates.bundleSize !== undefined) product.bundleSize = updates.bundleSize;
    if (updates.malaSize !== undefined) product.malaSize = updates.malaSize;
    if (updates.boriSize !== undefined) product.boriSize = updates.boriSize;
    if (updates.caseSize !== undefined) product.caseSize = updates.caseSize;
    if (updates.cartonSize !== undefined) product.cartonSize = updates.cartonSize;
    if (updates.customPackaging !== undefined) product.customPackaging = updates.customPackaging;
    if (updates.hsn !== undefined) product.hsn = updates.hsn;
    if (updates.isNrp !== undefined) product.isNrp = Boolean(updates.isNrp);
    if (updates.isFeatured !== undefined) product.featured = updates.isFeatured;
    if (updates.isNew !== undefined) product.newProduct = updates.isNew;
    if (updates.status) product.status = updates.status;
    if (updates.sortOrder !== undefined) product.sortOrder = Number(updates.sortOrder);
    if (updates.description !== undefined) product.description = updates.description;

    const incomingImgs = (Array.isArray(updates.images) && updates.images.length > 0 
      ? updates.images 
      : (Array.isArray(updates.gallery) && updates.gallery.length > 0 
        ? updates.gallery 
        : (updates.image ? [updates.image] : null)));
    if (incomingImgs && incomingImgs.length > 0) {
      product.images = incomingImgs.slice(0, 3).map((url: string, idx: number) => ({
        url,
        isPrimary: idx === 0,
        whiteBackground: true
      }));
    }

    await product.save();

    sendRealtimeEvent('SYNC_PRODUCTS', { action: 'UPDATED', productId: product.productId });

    await AdminActivity.create({
      action: 'PRODUCT_UPDATED',
      adminId: req.user?.id || 'ADMIN',
      details: `Updated product "${product.name}"`
    });

    return res.json({ success: true, data: { product }, message: 'Product updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id || '').trim();
    const bodyData = req.body || {};

    if (!idStr && !bodyData.sku && !bodyData.productId) {
      return res.status(400).json({ success: false, message: 'Product ID or SKU is required for deletion' });
    }

    const query = buildProductLookupQuery(idStr, bodyData);
    const existing = await Product.find(query);

    if (existing && existing.length > 0) {
      // 1. Delete all matching records from MongoDB
      await Product.deleteMany(query);

      // 2. Permanently record in deleted_products collection in MongoDB
      const db = mongoose.connection.db;
      if (db) {
        for (const p of existing) {
          const skuKey = String(p.sku || bodyData.sku || '').toUpperCase();
          if (skuKey) {
            await db.collection('deleted_products').updateOne(
              { sku: skuKey },
              { 
                $set: { 
                  sku: skuKey, 
                  productId: p.productId || idStr, 
                  name: p.name,
                  deletedAt: new Date(),
                  deletedBy: req.user?.email || req.user?.id || 'ADMIN'
                } 
              },
              { upsert: true }
            ).catch(() => {});
          }
        }
      }

      try {
        await AdminActivity.create({
          action: 'PRODUCT_DELETED',
          adminId: req.user?.id || 'ADMIN',
          adminName: req.user?.name || 'Administrator',
          details: `Permanently deleted product "${existing[0]?.name}" (SKU: ${existing[0]?.sku}, ID: ${existing[0]?.productId || existing[0]?._id})`
        });
      } catch (actErr: any) {}
    }

    // 3. Synchronize local initialData.js so client bundle has it deleted everywhere
    await syncInitialDataFile();

    // 4. Send realtime broadcast event to all clients
    sendRealtimeEvent('SYNC_PRODUCTS', { 
      action: 'DELETED', 
      productId: idStr, 
      sku: bodyData.sku || existing?.[0]?.sku 
    });

    return res.json({ 
      success: true, 
      message: 'Product permanently deleted from everywhere',
      data: {
        id: idStr,
        sku: bodyData.sku || existing?.[0]?.sku,
        name: bodyData.name || existing?.[0]?.name,
        deletedCount: existing?.length || 1
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete product' });
  }
};

export const toggleStatus = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id || '').trim();
    const query = buildProductLookupQuery(idStr);
    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.status = product.status === 'Published' ? 'Draft' : 'Published';
    await product.save();

    sendRealtimeEvent('SYNC_PRODUCTS', { action: 'STATUS_TOGGLED', productId: product.productId, status: product.status });

    return res.json({ success: true, data: { status: product.status }, message: `Product status updated to ${product.status}` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id || '').trim();
    const query = buildProductLookupQuery(idStr);
    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.featured = !product.featured;
    await product.save();

    sendRealtimeEvent('SYNC_PRODUCTS', { action: 'FEATURED_TOGGLED', productId: product.productId, featured: product.featured });

    return res.json({ success: true, data: { featured: product.featured }, message: 'Product featured status updated' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleNew = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id || '').trim();
    const query = buildProductLookupQuery(idStr);
    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.newProduct = !product.newProduct;
    await product.save();

    sendRealtimeEvent('SYNC_PRODUCTS', { action: 'NEW_TOGGLED', productId: product.productId, newProduct: product.newProduct });

    return res.json({ success: true, data: { newProduct: product.newProduct }, message: 'Product new arrival status updated' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductRanks = async (req: AuthRequest, res: Response) => {
  try {
    const { ranks } = req.body || {};
    if (!Array.isArray(ranks) || ranks.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid ranks array is required' });
    }

    const bulkOps = ranks.map((item: any, idx: number) => {
      const orderNum = typeof item.sortOrder === 'number' 
        ? item.sortOrder 
        : (typeof item.rank === 'number' ? item.rank : idx + 1);

      const itemId = String(item.id || item._id || item.productId || '').trim();
      const itemSku = String(item.sku || '').trim().toUpperCase();
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(itemId);

      const orConditions: any[] = [];
      if (isObjectId) orConditions.push({ _id: new mongoose.Types.ObjectId(itemId) });
      if (itemId) orConditions.push({ productId: itemId });
      if (itemSku) orConditions.push({ sku: itemSku });

      return {
        updateMany: {
          filter: orConditions.length > 0 ? { $or: orConditions } : { productId: itemId },
          update: { $set: { sortOrder: orderNum } },
          upsert: false
        }
      };
    });

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
    }

    // Always synchronize initialData.js with new sequence so all clients receive updated order
    await syncInitialDataFile();

    // Broadcast instant real-time event to all connected browsers & devices
    sendRealtimeEvent('SYNC_PRODUCTS', { action: 'REORDER', count: bulkOps.length, timestamp: Date.now() });

    return res.json({
      success: true,
      message: 'Product sequence synchronized successfully everywhere',
      data: { count: bulkOps.length }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update product order' });
  }
};

export const validateBulkCsv = async (req: Request, res: Response) => {
  const { rows } = req.body || {};
  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ success: false, message: 'Array of CSV rows required' });
  }

  if (rows.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Batch upload exceeds maximum permitted limit of 500 rows per request. Please split into smaller batches.'
    });
  }

  const validRows: any[] = [];
  const invalidRows: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const priceNum = Number(row.price);
    const stockNum = row.stock !== undefined ? Number(row.stock) : 100;

    if (!row.name || !row.sku || isNaN(priceNum) || priceNum < 0 || isNaN(stockNum) || stockNum < 0) {
      invalidRows.push({
        row: i + 1,
        sku: row.sku || 'N/A',
        error: 'Missing or invalid mandatory fields (name, valid SKU, or non-negative price/stock)'
      });
    } else {
      validRows.push({
        ...row,
        name: sanitizeCsvFormula(String(row.name).trim()),
        sku: sanitizeCsvFormula(String(row.sku).trim().toUpperCase()),
        company: sanitizeCsvFormula(String(row.brand || row.company || 'Amul').trim()),
        category: sanitizeCsvFormula(String(row.category || 'Food & Beverages').trim()),
        price: priceNum,
        stock: stockNum,
        id: `prod-bulk-${Date.now()}-${i}`
      });
    }
  }

  return res.json({
    success: true,
    data: { validRows, invalidRows, total: rows.length }
  });
};

export const importBulkCsv = async (req: AuthRequest, res: Response) => {
  const { products } = req.body || {};
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: 'Validated products array required' });
  }

  if (products.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Bulk import limit exceeded (max 500 products per operation).'
    });
  }

  const createdList = [];
  for (const item of products) {
    const priceNum = Math.max(0, Number(item.price) || 0);
    const stockNum = Math.max(0, Number(item.stock) || 100);

    const p = new Product({
      productId: item.id || `prod-ae-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku: sanitizeCsvFormula(String(item.sku).trim().toUpperCase()),
      name: sanitizeCsvFormula(String(item.name).trim()),
      companyName: sanitizeCsvFormula(item.brand || item.company || 'Amul'),
      categoryName: sanitizeCsvFormula(item.category || 'Food & Beverages'),
      price: priceNum,
      stock: stockNum,
      lowStockThreshold: Number(item.lowStockThreshold) || 20,
      packSize: item.packSize || '1 Unit',
      bundleSize: item.bundleSize || '5 Units',
      caseSize: item.caseSize || '10 Units',
      featured: true,
      newProduct: true,
      status: 'Published',
      images: [{ url: item.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80', isPrimary: true }]
    });
    await p.save();
    createdList.push(p);
  }

  await AdminActivity.create({
    action: 'BULK_IMPORT',
    adminId: req.user?.id || 'ADMIN',
    details: `Bulk imported ${createdList.length} SKUs into MongoDB database`
  });

  return res.json({
    success: true,
    data: { importedCount: createdList.length },
    message: `Successfully imported ${createdList.length} products into database`
  });
};
