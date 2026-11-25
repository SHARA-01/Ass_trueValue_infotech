// Shared TypeScript types

export type UserRole = 'user' | 'admin';

export type TicketStatus = 'Open' | 'In-Progress' | 'On-Hold' | 'Resolved' | 'Closed';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketCategory =
  | 'Technical Support'
  | 'Billing'
  | 'General Enquiry'
  | 'Bug Report'
  | 'Feature Request';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export interface UserSummary {
  _id: string;
  name: string;
  email?: string;
  role?: UserRole;
}

export interface ITicket {
  _id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  submitterId: string;
  submitter?: UserSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id: string;
  ticketId: string;
  authorId: string;
  author?: UserSummary;
  body: string;
  createdAt: Date;
}

export interface IActivityLog {
  _id: string;
  event: string;
  actorId: string;
  actor?: UserSummary;
  ticketId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  submitterId?: string;
}

// Express augmentation for req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}
