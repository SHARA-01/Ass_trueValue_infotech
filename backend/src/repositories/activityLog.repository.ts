import { ActivityLog } from '../models/ActivityLog';
import { IActivityLog } from '../types';
import { extractUserRef } from './populateHelper';

function toPlain(doc: unknown): IActivityLog {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = (doc as any).toObject ? (doc as any).toObject() : doc;
  const actorRef = extractUserRef(obj.actorId);
  return {
    _id: obj._id.toString(),
    event: obj.event,
    actorId: actorRef.id,
    ...(actorRef.summary ? { actor: actorRef.summary } : {}),
    ticketId: obj.ticketId?.toString(),
    metadata: obj.metadata,
    createdAt: obj.createdAt,
  };
}

export const activityLogRepository = {
  async create(data: {
    event: string;
    actorId: string;
    ticketId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<IActivityLog> {
    const doc = await ActivityLog.create(data);
    return toPlain(doc);
  },

  async findByTicketId(ticketId: string): Promise<IActivityLog[]> {
    const docs = await ActivityLog.find({ ticketId })
      .populate('actorId', 'name role')
      .sort({ createdAt: -1 });
    return docs.map(toPlain);
  },
};
