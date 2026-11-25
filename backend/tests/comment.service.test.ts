import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commentService } from '../src/services/comment.service';
import { AppError } from '../src/utils/errors';

// Mock repositories
vi.mock('../src/repositories/comment.repository', () => ({
  commentRepository: {
    create: vi.fn(),
    findByTicketId: vi.fn(),
  },
}));

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

// Mock eventBus
vi.mock('../src/events/eventBus', () => ({
  default: {
    emit: vi.fn(),
    on: vi.fn(),
    setMaxListeners: vi.fn(),
  },
}));

import { commentRepository } from '../src/repositories/comment.repository';
import { ticketRepository } from '../src/repositories/ticket.repository';

const mockCommentRepo = commentRepository as {
  create: ReturnType<typeof vi.fn>;
  findByTicketId: ReturnType<typeof vi.fn>;
};

const mockTicketRepo = ticketRepository as {
  findById: ReturnType<typeof vi.fn>;
};

const makeTicket = (submitterId: string) => ({
  _id: 'ticket-id-1',
  title: 'Test',
  description: 'desc',
  category: 'Technical Support' as const,
  priority: 'Low' as const,
  status: 'Open' as const,
  submitterId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeComment = () => ({
  _id: 'comment-id-1',
  ticketId: 'ticket-id-1',
  authorId: 'user-id-1',
  body: 'Hello!',
  createdAt: new Date(),
});

describe('commentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addComment', () => {
    it('should throw 403 when a user tries to comment on another user ticket', async () => {
      // ticket belongs to user-id-2, but user-id-1 is trying to comment
      mockTicketRepo.findById.mockResolvedValue(makeTicket('user-id-2'));

      await expect(
        commentService.addComment('ticket-id-1', 'Hello!', 'user-id-1', 'user')
      ).rejects.toMatchObject({
        statusCode: 403,
        message: "You can only comment on your own tickets",
      });

      expect(mockCommentRepo.create).not.toHaveBeenCalled();
    });

    it('should allow an admin to comment on any ticket', async () => {
      // ticket belongs to user-id-2, admin is commenting
      mockTicketRepo.findById.mockResolvedValue(makeTicket('user-id-2'));
      mockCommentRepo.create.mockResolvedValue(makeComment());

      const result = await commentService.addComment(
        'ticket-id-1',
        'Hello from admin!',
        'admin-id-1',
        'admin'
      );

      expect(mockCommentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ticketId: 'ticket-id-1', authorId: 'admin-id-1' })
      );
      expect(result).toMatchObject({ _id: 'comment-id-1' });
    });

    it('should allow owner to comment on their own ticket', async () => {
      mockTicketRepo.findById.mockResolvedValue(makeTicket('user-id-1'));
      mockCommentRepo.create.mockResolvedValue(makeComment());

      const result = await commentService.addComment(
        'ticket-id-1',
        'My comment',
        'user-id-1',
        'user'
      );

      expect(result).toMatchObject({ ticketId: 'ticket-id-1' });
    });
  });
});
