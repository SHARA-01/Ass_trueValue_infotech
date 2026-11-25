import { Schema, model, Document, Types } from 'mongoose';
import { TicketStatus, TicketPriority, TicketCategory } from '../types';

export interface TicketDocument extends Document {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  submitterId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<TicketDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Technical Support', 'Billing', 'General Enquiry', 'Bug Report', 'Feature Request'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['Open', 'In-Progress', 'On-Hold', 'Resolved', 'Closed'],
      default: 'Open',
    },
    submitterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Ticket = model<TicketDocument>('Ticket', TicketSchema);
