import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  status: 'Active' | 'Disabled';
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' }
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
