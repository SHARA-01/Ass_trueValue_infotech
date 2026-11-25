import { ticketRepository } from '../repositories/ticket.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { AppError } from '../utils/errors';
import eventBus from '../events/eventBus';
import { ITicket, IActivityLog, PaginatedResult, TicketFilters, TicketStatus, TicketPriority } from '../types';

export const ticketService = {
  async createTicket(
    data: {
      title: string;
      description: string;
      category: string;
      priority?: string;
    },
    submitterId: string
  ): Promise<ITicket> {
    const ticket = await ticketRepository.create({ ...data, submitterId });
    eventBus.emit('ticket.created', { actorId: submitterId, ticketId: ticket._id, metadata: { title: ticket.title } });
    return ticket;
  },

  async getOwnTickets(
    submitterId: string,
    filters: TicketFilters
  ): Promise<PaginatedResult<ITicket>> {
    return ticketRepository.findPaginated(filters, submitterId);
  },

  async getAllTickets(filters: TicketFilters): Promise<PaginatedResult<ITicket>> {
    return ticketRepository.findPaginated(filters);
  },

  async getTicketById(id: string, requesterId: string, requesterRole: string): Promise<ITicket> {
    const ticket = await ticketRepository.findById(id);
    if (!ticket) throw new AppError('Ticket not found', 404);
    if (requesterRole !== 'admin' && ticket.submitterId !== requesterId) {
      throw new AppError('Forbidden', 403);
    }
    return ticket;
  },

  async updateTicket(
    id: string,
    data: Partial<{ title: string; description: string; category: string; priority: string }>,
    requesterId: string
  ): Promise<ITicket> {
    const ticket = await ticketRepository.findById(id);
    if (!ticket) throw new AppError('Ticket not found', 404);
    if (ticket.submitterId !== requesterId) throw new AppError('Forbidden', 403);

    const updated = await ticketRepository.updateById(id, data);
    if (!updated) throw new AppError('Ticket not found', 404);

    eventBus.emit('ticket.updated', { actorId: requesterId, ticketId: id, metadata: data });
    return updated;
  },

  async deleteTicket(id: string, requesterId: string): Promise<void> {
    const ticket = await ticketRepository.findById(id);
    if (!ticket) throw new AppError('Ticket not found', 404);
    if (ticket.submitterId !== requesterId) throw new AppError('Forbidden', 403);
    if (ticket.status !== 'Open') {
      throw new AppError('Only Open tickets can be deleted', 400);
    }
    await ticketRepository.deleteById(id);
  },

  async changeStatus(id: string, status: TicketStatus, actorId: string): Promise<ITicket> {
    const ticket = await ticketRepository.findById(id);
    if (!ticket) throw new AppError('Ticket not found', 404);

    const updated = await ticketRepository.updateStatus(id, status);
    if (!updated) throw new AppError('Ticket not found', 404);

    eventBus.emit('ticket.status_changed', {
      actorId,
      ticketId: id,
      metadata: { from: ticket.status, to: status },
    });

    if (status === 'Resolved') {
      eventBus.emit('ticket.resolved', { actorId, ticketId: id });
    }

    return updated;
  },

  async changePriority(id: string, priority: TicketPriority, actorId: string): Promise<ITicket> {
    const ticket = await ticketRepository.findById(id);
    if (!ticket) throw new AppError('Ticket not found', 404);

    const updated = await ticketRepository.updatePriority(id, priority);
    if (!updated) throw new AppError('Ticket not found', 404);

    eventBus.emit('ticket.updated', {
      actorId,
      ticketId: id,
      metadata: { priorityChange: { from: ticket.priority, to: priority } },
    });

    return updated;
  },

  async getStats() {
    return ticketRepository.getStats();
  },

  async getTicketActivity(
    id: string,
    requesterId: string,
    requesterRole: string
  ): Promise<IActivityLog[]> {
    const ticket = await ticketRepository.findById(id);
    if (!ticket) throw new AppError('Ticket not found', 404);
    if (requesterRole !== 'admin' && ticket.submitterId !== requesterId) {
      throw new AppError('Forbidden', 403);
    }
    return activityLogRepository.findByTicketId(id);
  },
};
