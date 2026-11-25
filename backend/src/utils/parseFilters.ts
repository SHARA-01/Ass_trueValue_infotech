import { Request } from 'express';
import { TicketFilters } from '../types';

export function parseTicketFilters(query: Request['query']): TicketFilters {
  const parsedPage = query.page ? parseInt(query.page as string, 10) : undefined;
  const parsedLimit = query.limit ? parseInt(query.limit as string, 10) : undefined;

  return {
    status: (query.status as TicketFilters['status']) || undefined,
    priority: (query.priority as TicketFilters['priority']) || undefined,
    category: (query.category as TicketFilters['category']) || undefined,
    search: (query.search as string) || undefined,
    sortBy: (query.sortBy as string) || undefined,
    order: query.order === 'asc' || query.order === 'desc' ? query.order : undefined,
    page: parsedPage && !Number.isNaN(parsedPage) ? parsedPage : undefined,
    limit: parsedLimit && !Number.isNaN(parsedLimit) ? parsedLimit : undefined,
    submitterId: (query.submitterId as string) || undefined,
  };
}
