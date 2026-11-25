export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type TicketStatus =
  | 'Open'
  | 'In-Progress'
  | 'On-Hold'
  | 'Resolved'
  | 'Closed';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketCategory =
  | 'Technical Support'
  | 'Billing'
  | 'General Enquiry'
  | 'Bug Report'
  | 'Feature Request';

export const TICKET_STATUSES: TicketStatus[] = [
  'Open',
  'In-Progress',
  'On-Hold',
  'Resolved',
  'Closed',
];

export const TICKET_PRIORITIES: TicketPriority[] = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

export const TICKET_CATEGORIES: TicketCategory[] = [
  'Technical Support',
  'Billing',
  'General Enquiry',
  'Bug Report',
  'Feature Request',
];

export interface PopulatedUserRef {
  _id: string;
  name: string;
  email?: string;
  role?: UserRole;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  submitterId: string | PopulatedUserRef;
  submitter?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  ticketId: string;
  authorId: string | PopulatedUserRef;
  author?: {
    _id: string;
    name: string;
    role: UserRole;
  };
  body: string;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  event: string;
  actorId: string | PopulatedUserRef;
  actor?: {
    _id: string;
    name: string;
    role: UserRole;
  };
  ticketId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiFieldError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  category?: TicketCategory | '';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'title';
  order?: 'asc' | 'desc';
  submitterId?: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
}

export function getTicketSubmitterId(ticket: Ticket): string {
  if (typeof ticket.submitterId === 'object' && ticket.submitterId !== null) {
    return ticket.submitterId._id;
  }
  return ticket.submitter?._id ?? ticket.submitterId;
}

export function getTicketSubmitter(ticket: Ticket): { name: string; email?: string } {
  if (ticket.submitter) {
    return { name: ticket.submitter.name, email: ticket.submitter.email };
  }
  if (typeof ticket.submitterId === 'object' && ticket.submitterId !== null) {
    return { name: ticket.submitterId.name, email: ticket.submitterId.email };
  }
  return { name: 'User' };
}

export function getCommentAuthor(comment: Comment): { name: string; role?: UserRole } {
  if (comment.author) {
    return { name: comment.author.name, role: comment.author.role };
  }
  if (typeof comment.authorId === 'object' && comment.authorId !== null) {
    return { name: comment.authorId.name, role: comment.authorId.role };
  }
  return { name: 'User' };
}

export function getActivityActor(log: ActivityLog): { name: string; role?: UserRole } {
  if (log.actor) {
    return { name: log.actor.name, role: log.actor.role };
  }
  if (typeof log.actorId === 'object' && log.actorId !== null) {
    return { name: log.actorId.name, role: log.actorId.role };
  }
  return { name: 'System' };
}
