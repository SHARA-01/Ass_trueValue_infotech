import { Schema, model, Document, Types } from 'mongoose';

export interface CommentDocument extends Document {
  ticketId: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
  createdAt: Date;
}

const CommentSchema = new Schema<CommentDocument>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Comment = model<CommentDocument>('Comment', CommentSchema);
