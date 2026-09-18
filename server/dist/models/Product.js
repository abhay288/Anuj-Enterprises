import mongoose, { Schema } from 'mongoose';
const ProductImageSchema = new Schema({
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
    whiteBackground: { type: Boolean, default: false }
}, { _id: false });
const ProductSchema = new Schema({
    productId: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, index: true },
    categoryName: { type: String, required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    images: [ProductImageSchema],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 20, min: 1 },
    unitType: { type: String, default: 'Piece' },
    unitQuantity: { type: String, default: '' },
    packSize: { type: String, default: '' },
    bundleSize: { type: String, default: '' },
    malaSize: { type: String, default: '' },
    boriSize: { type: String, default: '' },
    caseSize: { type: String, default: '' },
    cartonSize: { type: String, default: '' },
    customPackaging: { type: String, default: '' },
    hsn: { type: String, default: '19053100' },
    isNrp: { type: Boolean, default: false },
    featured: { type: Boolean, default: false, index: true },
    newProduct: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published', index: true },
    sortOrder: { type: Number, default: 0, index: true },
    createdBy: { type: String, default: 'ADMIN' },
    updatedBy: { type: String, default: 'ADMIN' }
}, { timestamps: true });
// Indexes
ProductSchema.index({ name: 'text', sku: 'text', companyName: 'text', categoryName: 'text' });
ProductSchema.index({ status: 1, sortOrder: 1 });
ProductSchema.index({ status: 1, companyName: 1, categoryName: 1 });
ProductSchema.index({ status: 1, featured: 1 });
ProductSchema.index({ status: 1, newProduct: 1 });
ProductSchema.index({ status: 1, price: 1 });
export const Product = mongoose.model('Product', ProductSchema);
