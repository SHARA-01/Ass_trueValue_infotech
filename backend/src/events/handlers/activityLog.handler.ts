import eventBus from '../eventBus';
import { activityLogRepository } from '../../repositories/activityLog.repository';

interface ActivityEvent {
  actorId: string;
  ticketId?: string;
  metadata?: Record<string, unknown>;
}

const events = [
  'ticket.created',
  'ticket.updated',
  'ticket.status_changed',
  'comment.added',
  'ticket.resolved',
];

export function registerActivityLogHandler(): void {
  for (const event of events) {
    eventBus.on(event, async (payload: ActivityEvent) => {
      try {
        await activityLogRepository.create({
          event,
          actorId: payload.actorId,
          ticketId: payload.ticketId,
          metadata: payload.metadata,
        });
      } catch (err) {
        console.error(`ActivityLog handler error for event "${event}":`, err);
      }
    });
  }
}
