import { commentRepository } from '../repositories/comment.repository';
import { ticketRepository } from '../repositories/ticket.repository';
import { AppError } from '../utils/errors';
import eventBus from '../events/eventBus';
import { IComment } from '../types';

export const commentService = {
  async addComment(
    ticketId: string,
    body: string,
    authorId: string,
    authorRole: string
  ): Promise<IComment> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new AppError('Ticket not found', 404);

    if (authorRole !== 'admin' && ticket.submitterId !== authorId) {
      throw new AppError('You can only comment on your own tickets', 403);
    }

    const comment = await commentRepository.create({ ticketId, authorId, body });
    eventBus.emit('comment.added', { actorId: authorId, ticketId, metadata: { commentId: comment._id } });
    return comment;
  },

  async getComments(
    ticketId: string,
    requesterId: string,
    requesterRole: string
  ): Promise<IComment[]> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new AppError('Ticket not found', 404);

    if (requesterRole !== 'admin' && ticket.submitterId !== requesterId) {
      throw new AppError('Forbidden', 403);
    }

    return commentRepository.findByTicketId(ticketId);
  },
};
