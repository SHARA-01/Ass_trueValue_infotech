import { useCallback, useEffect, useState } from 'react';
import api, { extractApiError } from '../api/axios';
import type {
  ActivityLog,
  AdminStats,
  ApiResponse,
  CreateTicketPayload,
  PaginatedResponse,
  Ticket,
  TicketPriority,
  TicketQueryParams,
  TicketStatus,
  UpdateTicketPayload,
} from '../types';

function buildQueryParams(params: TicketQueryParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.status) query.status = params.status;
  if (params.priority) query.priority = params.priority;
  if (params.category) query.category = params.category;
  if (params.search && params.search.trim()) query.search = params.search.trim();
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.order) query.order = params.order;
  if (params.submitterId && params.submitterId.trim()) {
    query.submitterId = params.submitterId.trim();
  }
  return query;
}

export function useTickets(options?: {
  admin?: boolean;
  initialParams?: TicketQueryParams;
}) {
  const isAdmin = options?.admin ?? false;
  const [params, setParams] = useState<TicketQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    order: 'desc',
    ...options?.initialParams,
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isAdmin ? '/admin/tickets' : '/tickets';
      const response = await api.get<ApiResponse<PaginatedResponse<Ticket>>>(
        endpoint,
        {
          params: buildQueryParams(params),
        }
      );
      const result = response.data.data;
      if (result) {
        setTickets(result.data);
        setTotal(result.total);
        setTotalPages(Math.max(1, result.totalPages || 1));
      } else {
        setTickets([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError(extractApiError(err, 'Failed to load tickets.').message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, params]);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const updateStatus = useCallback(
    async (ticketId: string, status: TicketStatus): Promise<Ticket> => {
      const response = await api.patch<ApiResponse<Ticket>>(
        `/admin/tickets/${ticketId}/status`,
        { status }
      );
      const updated = response.data.data;
      if (!updated) {
        throw new Error(response.data.message || 'Failed to update status');
      }
      setTickets((prev) =>
        prev.map((item) => (item._id === ticketId ? updated : item))
      );
      return updated;
    },
    []
  );

  const updatePriority = useCallback(
    async (ticketId: string, priority: TicketPriority): Promise<Ticket> => {
      const response = await api.patch<ApiResponse<Ticket>>(
        `/admin/tickets/${ticketId}/priority`,
        { priority }
      );
      const updated = response.data.data;
      if (!updated) {
        throw new Error(response.data.message || 'Failed to update priority');
      }
      setTickets((prev) =>
        prev.map((item) => (item._id === ticketId ? updated : item))
      );
      return updated;
    },
    []
  );

  return {
    tickets,
    total,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    totalPages,
    loading,
    error,
    params,
    setParams,
    refetch: fetchTickets,
    updateStatus,
    updatePriority,
  };
}

export function useTicketDetail(ticketId: string | undefined) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<Ticket>>(`/tickets/${ticketId}`);
      setTicket(response.data.data ?? null);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load ticket details.').message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const fetchActivity = useCallback(async () => {
    if (!ticketId) return;
    setActivityLoading(true);
    setActivityError(null);
    try {
      const response = await api.get<ApiResponse<ActivityLog[]>>(
        `/tickets/${ticketId}/activity`
      );
      setActivity(response.data.data ?? []);
    } catch (err) {
      setActivityError(
        extractApiError(err, 'Failed to load activity log.').message
      );
    } finally {
      setActivityLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    void fetchTicket();
    void fetchActivity();
  }, [fetchTicket, fetchActivity]);

  const updateTicket = useCallback(
    async (payload: UpdateTicketPayload): Promise<Ticket> => {
      if (!ticketId) throw new Error('Missing ticket ID');
      const response = await api.patch<ApiResponse<Ticket>>(
        `/tickets/${ticketId}`,
        payload
      );
      const updated = response.data.data;
      if (!updated) {
        throw new Error(response.data.message || 'Failed to update ticket');
      }
      setTicket(updated);
      void fetchActivity();
      return updated;
    },
    [ticketId, fetchActivity]
  );

  const deleteTicket = useCallback(async (): Promise<void> => {
    if (!ticketId) throw new Error('Missing ticket ID');
    await api.delete<ApiResponse<null>>(`/tickets/${ticketId}`);
  }, [ticketId]);

  const updateStatus = useCallback(
    async (status: TicketStatus): Promise<Ticket> => {
      if (!ticketId) throw new Error('Missing ticket ID');
      const response = await api.patch<ApiResponse<Ticket>>(
        `/admin/tickets/${ticketId}/status`,
        { status }
      );
      const updated = response.data.data;
      if (!updated) {
        throw new Error(response.data.message || 'Failed to update status');
      }
      setTicket(updated);
      void fetchActivity();
      return updated;
    },
    [ticketId, fetchActivity]
  );

  const updatePriority = useCallback(
    async (priority: TicketPriority): Promise<Ticket> => {
      if (!ticketId) throw new Error('Missing ticket ID');
      const response = await api.patch<ApiResponse<Ticket>>(
        `/admin/tickets/${ticketId}/priority`,
        { priority }
      );
      const updated = response.data.data;
      if (!updated) {
        throw new Error(response.data.message || 'Failed to update priority');
      }
      setTicket(updated);
      void fetchActivity();
      return updated;
    },
    [ticketId, fetchActivity]
  );

  return {
    ticket,
    activity,
    loading,
    activityLoading,
    error,
    activityError,
    refetchTicket: fetchTicket,
    refetchActivity: fetchActivity,
    updateTicket,
    deleteTicket,
    updateStatus,
    updatePriority,
  };
}

export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const response = await api.post<ApiResponse<Ticket>>('/tickets', payload);
  const created = response.data.data;
  if (!created) {
    throw new Error(response.data.message || 'Failed to create ticket');
  }
  return created;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
      setStats(response.data.data ?? null);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load admin statistics.').message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
