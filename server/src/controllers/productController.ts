import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

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
      queryFilter.companyName = new RegExp(`^${company}$`, 'i');
    }

    if (category && category !== 'All') {
      queryFilter.categoryName = new RegExp(`^${category}$`, 'i');
    }

    if (featured === 'true') {
      queryFilter.featured = true;
    }

    if (newProduct === 'true') {
      queryFilter.newProduct = true;
    }

    if (status) {
      queryFilter.status = status;
    } else {
      queryFilter.status = 'Published';
    }

    if (search) {
      const q = String(search).trim();
      const tokens = q.split(/\s+/).filter(Boolean);
      if (tokens.length > 1) {
        // Multi-token matching: all tokens must match
        queryFilter.$and = tokens.map(token => ({
          $or: [
            { name: new RegExp(token, 'i') },
            { sku: new RegExp(token, 'i') },
            { companyName: new RegExp(token, 'i') },
            { categoryName: new RegExp(token, 'i') },
            { description: new RegExp(token, 'i') }
          ]
        }));
      } else {
        queryFilter.$or = [
          { name: new RegExp(q, 'i') },
          { sku: new RegExp(q, 'i') },
          { companyName: new RegExp(q, 'i') },
          { categoryName: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') }
        ];
      }
    }

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(queryFilter)
        .sort({ [String(sort)]: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(queryFilter)
    ]);

    const formatted = products.map((p: any) => ({
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
      packSize: p.packSize,
      bundleSize: p.bundleSize,
      caseSize: p.caseSize,
      isFeatured: p.featured,
      isNew: p.newProduct,
      status: p.status,
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
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOne({ $or: [{ productId: idStr }, { sku: idStr }, { _id: isObjectId ? idStr : null }] }).lean();

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
          price: product.price,
          stock: product.stock,
          packSize: product.packSize,
          bundleSize: product.bundleSize,
          caseSize: product.caseSize,
          isFeatured: product.featured,
          isNew: product.newProduct,
          status: product.status,
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
      packSize, bundleSize, caseSize, description, image, isFeatured, isNew, status 
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
      stock: Number(stock || 50),
      packSize: packSize || '1 Unit',
      bundleSize: bundleSize || '5 Units',
      caseSize: caseSize || '10 Units',
      featured: isFeatured ?? true,
      newProduct: isNew ?? true,
      status: status || 'Published',
      images: [{ url: image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80', isPrimary: true, whiteBackground: true }],
      createdBy: req.user?.id || 'ADMIN'
    });

    await product.save();

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
    const idStr = String(req.params.id);
    const updates = req.body || {};
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);

    const product = await Product.findOne({ $or: [{ productId: idStr }, { sku: idStr }, { _id: isObjectId ? idStr : null }] });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (updates.name) product.name = updates.name;
    if (updates.brand || updates.company) product.companyName = updates.brand || updates.company;
    if (updates.category) product.categoryName = updates.category;
    if (updates.price !== undefined) product.price = Number(updates.price);
    if (updates.stock !== undefined) product.stock = Number(updates.stock);
    if (updates.packSize) product.packSize = updates.packSize;
    if (updates.bundleSize) product.bundleSize = updates.bundleSize;
    if (updates.caseSize) product.caseSize = updates.caseSize;
    if (updates.isFeatured !== undefined) product.featured = updates.isFeatured;
    if (updates.isNew !== undefined) product.newProduct = updates.isNew;
    if (updates.status) product.status = updates.status;
    if (updates.image) {
      product.images = [{ url: updates.image, isPrimary: true, whiteBackground: true }];
    }

    await product.save();

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
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOneAndDelete({ $or: [{ productId: idStr }, { sku: idStr }, { _id: isObjectId ? idStr : null }] });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await AdminActivity.create({
      action: 'PRODUCT_DELETED',
      adminId: req.user?.id || 'ADMIN',
      details: `Deleted product "${product.name}" (SKU: ${product.sku})`
    });

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleStatus = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOne({ $or: [{ productId: idStr }, { sku: idStr }, { _id: isObjectId ? idStr : null }] });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.status = product.status === 'Published' ? 'Draft' : 'Published';
    await product.save();

    return res.json({ success: true, data: { status: product.status }, message: `Product status updated to ${product.status}` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOne({ $or: [{ productId: idStr }, { sku: idStr }, { _id: isObjectId ? idStr : null }] });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.featured = !product.featured;
    await product.save();

    return res.json({ success: true, data: { featured: product.featured }, message: 'Product featured status updated' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleNew = async (req: AuthRequest, res: Response) => {
  try {
    const idStr = String(req.params.id);
    const isObjectId = idStr.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOne({ $or: [{ productId: idStr }, { sku: idStr }, { _id: isObjectId ? idStr : null }] });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.newProduct = !product.newProduct;
    await product.save();

    return res.json({ success: true, data: { newProduct: product.newProduct }, message: 'Product new arrival status updated' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
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
        name: String(row.name).trim(),
        sku: String(row.sku).trim().toUpperCase(),
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
      sku: String(item.sku).trim().toUpperCase(),
      name: String(item.name).trim(),
      companyName: item.brand || item.company || 'Amul',
      categoryName: item.category || 'Food & Beverages',
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
