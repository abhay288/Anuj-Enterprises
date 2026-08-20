import mongoose, { Schema, Document } from 'mongoose';

export type InventoryChangeType = 
  | 'STOCK_ADDED' 
  | 'ORDER_DEDUCTION' 
  | 'ORDER_CANCELLATION_RESTOCK' 
  | 'MANUAL_ADJUSTMENT';

export interface IInventoryLog extends Document {
  productId: string;
  sku: string;
  productName: string;
  changeType: InventoryChangeType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  adminName?: string;
  orderId?: string;
  createdAt: Date;
}

const InventoryLogSchema: Schema = new Schema(
  {
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
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

InventoryLogSchema.index({ createdAt: -1 });

export const InventoryLog = mongoose.model<IInventoryLog>('InventoryLog', InventoryLogSchema);
