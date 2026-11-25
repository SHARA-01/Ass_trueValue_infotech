import { Comment } from '../models/Comment';
import { IComment } from '../types';
import { extractUserRef } from './populateHelper';

function toPlain(doc: unknown): IComment {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = (doc as any).toObject ? (doc as any).toObject() : doc;
  const authorRef = extractUserRef(obj.authorId);
  return {
    _id: obj._id.toString(),
    ticketId: obj.ticketId.toString(),
    authorId: authorRef.id,
    ...(authorRef.summary ? { author: authorRef.summary } : {}),
    body: obj.body,
    createdAt: obj.createdAt,
  };
}

export const commentRepository = {
  async create(data: { ticketId: string; authorId: string; body: string }): Promise<IComment> {
    const doc = await Comment.create(data);
    await doc.populate('authorId', 'name role');
    return toPlain(doc);
  },

  async findByTicketId(ticketId: string): Promise<IComment[]> {
    const docs = await Comment.find({ ticketId })
      .populate('authorId', 'name role')
      .sort({ createdAt: 1 });
    return docs.map(toPlain);
  },
};
