import mongoose, { Schema } from 'mongoose';
const InventoryLogSchema = new Schema({
    productId: { type: String, required: true, index: true },
    sku: { type: String, required: true, index: true, uppercase: true },
    productName: { type: String, required: true },
    changeType: {
        type: String,
        required: true,
        enum: ['STOCK_ADDED', 'ORDER_DEDUCTION', 'ORDER_CANCELLATION_RESTOCK', 'MANUAL_ADJUSTMENT'],
        index: true
    },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
    performedBy: { type: String, default: 'ADMIN' },
    adminName: { type: String, default: 'Managing Director' },
    orderId: { type: String, default: '' }
}, { timestamps: { createdAt: true, updatedAt: false } });
InventoryLogSchema.index({ createdAt: -1 });
export const InventoryLog = mongoose.model('InventoryLog', InventoryLogSchema);
