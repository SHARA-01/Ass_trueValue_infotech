import { Ticket } from '../models/Ticket';
import { ITicket, TicketFilters, PaginatedResult, TicketStatus, TicketPriority } from '../types';
import { extractUserRef } from './populateHelper';

function toPlain(doc: unknown): ITicket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = (doc as any).toObject ? (doc as any).toObject() : doc;
  const submitterRef = extractUserRef(obj.submitterId);
  return {
    _id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    category: obj.category,
    priority: obj.priority,
    status: obj.status,
    submitterId: submitterRef.id,
    ...(submitterRef.summary ? { submitter: submitterRef.summary } : {}),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

export const ticketRepository = {
  async create(data: {
    title: string;
    description: string;
    category: string;
    priority?: string;
    submitterId: string;
  }): Promise<ITicket> {
    const doc = await Ticket.create(data);
    await doc.populate('submitterId', 'name email');
    return toPlain(doc);
  },

  async findById(id: string): Promise<ITicket | null> {
    const doc = await Ticket.findById(id).populate('submitterId', 'name email');
    return doc ? toPlain(doc) : null;
  },

  async findPaginated(
    filters: TicketFilters,
    submitterIdFilter?: string
  ): Promise<PaginatedResult<ITicket>> {
    const query: Record<string, unknown> = {};

    if (submitterIdFilter) query.submitterId = submitterIdFilter;
    if (filters.submitterId) query.submitterId = filters.submitterId;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.category) query.category = filters.category;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.order === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      Ticket.find(query)
        .populate('submitterId', 'name email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      Ticket.countDocuments(query),
    ]);

    return {
      data: docs.map(toPlain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateById(
    id: string,
    data: Partial<{ title: string; description: string; category: string; priority: string }>
  ): Promise<ITicket | null> {
    const doc = await Ticket.findByIdAndUpdate(id, { $set: data }, { new: true }).populate('submitterId', 'name email');
    return doc ? toPlain(doc) : null;
  },

  async updateStatus(id: string, status: TicketStatus): Promise<ITicket | null> {
    const doc = await Ticket.findByIdAndUpdate(id, { $set: { status } }, { new: true }).populate('submitterId', 'name email');
    return doc ? toPlain(doc) : null;
  },

  async updatePriority(id: string, priority: TicketPriority): Promise<ITicket | null> {
    const doc = await Ticket.findByIdAndUpdate(id, { $set: { priority } }, { new: true }).populate('submitterId', 'name email');
    return doc ? toPlain(doc) : null;
  },

  async deleteById(id: string): Promise<boolean> {
    const result = await Ticket.findByIdAndDelete(id);
    return result !== null;
  },

  async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const [total, byStatus, byPriority, byCategory] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    const toMap = (arr: { _id: string; count: number }[]) =>
      arr.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {} as Record<string, number>);

    return {
      total,
      byStatus: toMap(byStatus),
      byPriority: toMap(byPriority),
      byCategory: toMap(byCategory),
    };
  },
};
