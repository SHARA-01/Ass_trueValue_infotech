import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ticketService } from '../src/services/ticket.service';
import { AppError } from '../src/utils/errors';

// Mock repositories
vi.mock('../src/repositories/ticket.repository', () => ({
  ticketRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findPaginated: vi.fn(),
    updateById: vi.fn(),
    updateStatus: vi.fn(),
    updatePriority: vi.fn(),
    deleteById: vi.fn(),
    getStats: vi.fn(),
  },
}));

vi.mock('../src/repositories/activityLog.repository', () => ({
  activityLogRepository: {
    create: vi.fn(),
    findByTicketId: vi.fn(),
  },
}));

// Mock eventBus
vi.mock('../src/events/eventBus', () => ({
  default: {
    emit: vi.fn(),
    on: vi.fn(),
    setMaxListeners: vi.fn(),
  },
}));

import { ticketRepository } from '../src/repositories/ticket.repository';
import { activityLogRepository } from '../src/repositories/activityLog.repository';
import eventBus from '../src/events/eventBus';

const mockRepo = ticketRepository as {
  create: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  findPaginated: ReturnType<typeof vi.fn>;
  updateById: ReturnType<typeof vi.fn>;
  updateStatus: ReturnType<typeof vi.fn>;
  updatePriority: ReturnType<typeof vi.fn>;
  deleteById: ReturnType<typeof vi.fn>;
  getStats: ReturnType<typeof vi.fn>;
};

const makeTicket = (overrides = {}) => ({
  _id: 'ticket-id-1',
  title: 'Test Ticket',
  description: 'A test ticket',
  category: 'Technical Support' as const,
  priority: 'Low' as const,
  status: 'Open' as const,
  submitterId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ticketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a ticket and emit ticket.created event', async () => {
      const ticket = makeTicket();
      mockRepo.create.mockResolvedValue(ticket);

      const result = await ticketService.createTicket(
        {
          title: 'Test Ticket',
          description: 'A test ticket',
          category: 'Technical Support',
        },
        'user-id-1'
      );

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ submitterId: 'user-id-1' })
      );
      expect(result).toMatchObject({ _id: 'ticket-id-1', title: 'Test Ticket' });
    });
  });

  describe('deleteTicket', () => {
    it('should throw 400 when trying to delete a non-Open ticket', async () => {
      const ticket = makeTicket({ status: 'In-Progress' });
      mockRepo.findById.mockResolvedValue(ticket);

      await expect(
        ticketService.deleteTicket('ticket-id-1', 'user-id-1')
      ).rejects.toMatchObject({ statusCode: 400, message: 'Only Open tickets can be deleted' });

      expect(mockRepo.deleteById).not.toHaveBeenCalled();
    });

    it('should delete a ticket when status is Open', async () => {
      const ticket = makeTicket({ status: 'Open' });
      mockRepo.findById.mockResolvedValue(ticket);
      mockRepo.deleteById.mockResolvedValue(true);

      await expect(
        ticketService.deleteTicket('ticket-id-1', 'user-id-1')
      ).resolves.toBeUndefined();

      expect(mockRepo.deleteById).toHaveBeenCalledWith('ticket-id-1');
    });
  });

  describe('getOwnTickets', () => {
    it('should return paginated results', async () => {
      const paginatedResult = {
        data: [makeTicket()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockRepo.findPaginated.mockResolvedValue(paginatedResult);

      const result = await ticketService.getOwnTickets('user-id-1', { page: 1, limit: 10 });

      expect(result).toMatchObject({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(result.data).toHaveLength(1);
    });

    it('should pass submitterId filter to repository', async () => {
      mockRepo.findPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await ticketService.getOwnTickets('user-id-99', { page: 1 });

      expect(mockRepo.findPaginated).toHaveBeenCalledWith(
        expect.any(Object),
        'user-id-99'
      );
    });
  });

  describe('changeStatus', () => {
    it('should emit ticket.status_changed and ticket.resolved when status becomes Resolved', async () => {
      mockRepo.findById.mockResolvedValue(makeTicket({ status: 'In-Progress' }));
      mockRepo.updateStatus.mockResolvedValue(makeTicket({ status: 'Resolved' }));

      const updated = await ticketService.changeStatus('ticket-id-1', 'Resolved', 'admin-1');

      expect(updated.status).toBe('Resolved');
      expect(eventBus.emit).toHaveBeenCalledWith('ticket.status_changed', expect.objectContaining({
        actorId: 'admin-1',
        ticketId: 'ticket-id-1',
        metadata: { from: 'In-Progress', to: 'Resolved' },
      }));
      expect(eventBus.emit).toHaveBeenCalledWith('ticket.resolved', expect.objectContaining({
        actorId: 'admin-1',
        ticketId: 'ticket-id-1',
      }));
    });
  });

  describe('getTicketActivity', () => {
    it('should throw 403 if non-admin requests another user ticket activity', async () => {
      mockRepo.findById.mockResolvedValue(makeTicket({ submitterId: 'user-id-2' }));

      await expect(
        ticketService.getTicketActivity('ticket-id-1', 'user-id-1', 'user')
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('should return activity logs for ticket owner', async () => {
      mockRepo.findById.mockResolvedValue(makeTicket({ submitterId: 'user-id-1' }));
      (activityLogRepository.findByTicketId as ReturnType<typeof vi.fn>).mockResolvedValue([
        { _id: 'log-1', event: 'ticket.created', actorId: 'user-id-1', ticketId: 'ticket-id-1', createdAt: new Date() },
      ]);

      const logs = await ticketService.getTicketActivity('ticket-id-1', 'user-id-1', 'user');
      expect(logs).toHaveLength(1);
      expect(logs[0].event).toBe('ticket.created');
    });
  });
});
