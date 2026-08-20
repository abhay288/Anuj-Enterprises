import mongoose, { Schema, Document } from 'mongoose';

export interface IProductImage {
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  whiteBackground?: boolean;
}

export interface IProduct extends Document {
  productId: string;
  sku: string;
  name: string;
  companyName: string;
  categoryName: string;
  companyId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  description: string;
  images: IProductImage[];
  price: number;
  mrp?: number;
  stock: number;
  lowStockThreshold?: number;
  packSize: string;
  bundleSize?: string;
  caseSize?: string;
  featured: boolean;
  newProduct: boolean;
  status: 'Published' | 'Draft';
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  isPrimary: { type: Boolean, default: false },
  whiteBackground: { type: Boolean, default: false }
}, { _id: false });

const ProductSchema: Schema = new Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, index: true },
    categoryName: { type: String, required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String, default: '' },
    images: [ProductImageSchema],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 20, min: 1 },
    packSize: { type: String, default: '1 Unit' },
    bundleSize: { type: String, default: '5 Units' },
    caseSize: { type: String, default: '10 Units' },
    featured: { type: Boolean, default: false, index: true },
    newProduct: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published', index: true },
    createdBy: { type: String, default: 'ADMIN' },
    updatedBy: { type: String, default: 'ADMIN' }
  },
  { timestamps: true }
);

// Indexes
ProductSchema.index({ name: 'text', sku: 'text', companyName: 'text', categoryName: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
