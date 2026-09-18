import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string;
  name: string;
  phone: string;
  email?: string;
  category: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolutionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    category: { type: String, default: 'Order Dispatch & Tracking' },
    priority: { type: String, enum: ['NORMAL', 'HIGH', 'URGENT'], default: 'HIGH' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
    resolutionNote: { type: String, default: '' }
  },
  { timestamps: true }
);

TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ priority: 1, createdAt: -1 });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
