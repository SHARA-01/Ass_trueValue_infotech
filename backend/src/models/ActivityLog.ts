import { Schema, model, Document, Types } from 'mongoose';

export interface ActivityLogDocument extends Document {
  event: string;
  actorId: Types.ObjectId;
  ticketId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<ActivityLogDocument>(
  {
    event: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog = model<ActivityLogDocument>('ActivityLog', ActivityLogSchema);
