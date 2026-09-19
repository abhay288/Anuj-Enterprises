import mongoose, { Schema } from 'mongoose';
const OrderItemSchema = new Schema({
    productId: { type: String, required: true },
    sku: { type: String, required: true },
    productName: { type: String, required: true },
    companyName: { type: String, default: '' },
    categoryName: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    packSize: { type: String, default: '1 Unit' },
    bundleSize: { type: String, default: '' },
    caseSize: { type: String, default: '' },
    isPriority: { type: Boolean, default: false },
    total: { type: Number, required: true }
}, { _id: false });
const OrderSchema = new Schema({
    orderId: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, index: true },
    salesmanId: { type: String, required: true, index: true },
    salesmanName: { type: String, required: true },
    shopOwnerName: { type: String, default: '' },
    shopOwnerArea: { type: String, default: '' },
    shopRoute: { type: String, default: '' },
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerClassification: { type: String, enum: ['NORMAL', 'DAMAGE', 'EXPIRY'], default: 'NORMAL' },
    customerDetails: {
        mobile: String,
        email: String,
        address: String,
        city: String,
        state: String,
        gstin: String
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    items: [OrderItemSchema],
    totalQuantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Cash' },
    hasUrgentItems: { type: Boolean, default: false, index: true },
    expiredItems: { type: Array, default: [] },
    returnItems: { type: Array, default: [] },
    orderType: { type: String, enum: ['OFFLINE_COLLECTION'], default: 'OFFLINE_COLLECTION' },
    paymentStatus: { type: String, enum: ['OFFLINE'], default: 'OFFLINE' },
    collectionStatus: { type: String, enum: ['PENDING', 'COLLECTED'], default: 'PENDING' },
    status: {
        type: String,
        enum: ['NEW', 'CONFIRMED', 'READY_FOR_COLLECTION', 'COMPLETED', 'CANCELLED'],
        default: 'NEW'
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    readBy: { type: String, default: '' }
}, { timestamps: true });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ salesmanId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ customerName: 1 });
export const Order = mongoose.model('Order', OrderSchema);
