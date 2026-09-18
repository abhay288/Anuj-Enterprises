import mongoose, { Schema } from 'mongoose';
const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' }
}, { timestamps: true });
export const Category = mongoose.model('Category', CategorySchema);
