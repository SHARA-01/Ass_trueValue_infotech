import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpDown,
  ExternalLink,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { extractApiError } from '../api/axios';
import { Layout } from '../components/Layout';
import { Pagination } from '../components/Pagination';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useTickets } from '../hooks/useTickets';
import {
  getTicketSubmitter,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from '../types';

export const AdminTicketsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = (searchParams.get('status') as TicketStatus | null) ?? '';
  const initialPriority =
    (searchParams.get('priority') as TicketPriority | null) ?? '';
  const initialCategory =
    (searchParams.get('category') as TicketCategory | null) ?? '';
  const initialSubmitterId = searchParams.get('submitterId') ?? '';

  const {
    tickets,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    params,
    setParams,
    refetch,
    updateStatus,
    updatePriority,
  } = useTickets({
    admin: true,
    initialParams: {
      status: initialStatus,
      priority: initialPriority,
      category: initialCategory,
      submitterId: initialSubmitterId,
    },
  });

  const [searchInput, setSearchInput] = useState(params.search ?? '');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [inlineSuccess, setInlineSuccess] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setParams((prev) => {
        if ((prev.search ?? '') === searchInput) return prev;
        return { ...prev, search: searchInput, page: 1 };
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, setParams]);

  const hasActiveFilters = Boolean(
    params.status ||
      params.priority ||
      params.category ||
      params.search ||
      params.submitterId
  );

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
    setParams((prev) => ({
      ...prev,
      page: 1,
      status: '',
      priority: '',
      category: '',
      search: '',
      submitterId: '',
    }));
  };

  const handleInlineStatus = async (
    ticketId: string,
    nextStatus: TicketStatus
  ) => {
    setUpdatingId(ticketId);
    setInlineError(null);
    setInlineSuccess(null);
    try {
      await updateStatus(ticketId, nextStatus);
      setInlineSuccess(`Ticket status updated to ${nextStatus}.`);
    } catch (err) {
      setInlineError(
        extractApiError(err, 'Failed to update Ticket status.').message
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInlinePriority = async (
    ticketId: string,
    nextPriority: TicketPriority
  ) => {
    setUpdatingId(ticketId);
    setInlineError(null);
    setInlineSuccess(null);
    try {
      await updatePriority(ticketId, nextPriority);
      setInlineSuccess(`Ticket priority updated to ${nextPriority}.`);
    } catch (err) {
      setInlineError(
        extractApiError(err, 'Failed to update Ticket priority.').message
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              All Tickets
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review, filter, and triage all Tickets across Submitters.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Inline Feedback */}
        {inlineError && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{inlineError}</span>
            </div>
            <button
              type="button"
              onClick={() => setInlineError(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {inlineSuccess && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <span>{inlineSuccess}</span>
            <button
              type="button"
              onClick={() => setInlineSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tickets..."
                className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="md:col-span-2">
              <select
                aria-label="Filter by Status"
                value={params.status ?? ''}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    status: e.target.value as TicketStatus | '',
                    page: 1,
                  }))
                }
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Statuses</option>
                {TICKET_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                aria-label="Filter by Priority"
                value={params.priority ?? ''}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    priority: e.target.value as TicketPriority | '',
                    page: 1,
                  }))
                }
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Priorities</option>
                {TICKET_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                aria-label="Filter by Category"
                value={params.category ?? ''}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    category: e.target.value as TicketCategory | '',
                    page: 1,
                  }))
                }
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Categories</option>
                {TICKET_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 md:col-span-3">
              <div className="relative flex-1">
                <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <select
                  aria-label="Sort tickets"
                  value={`${params.sortBy ?? 'createdAt'}:${params.order ?? 'desc'}`}
                  onChange={(e) => {
                    const [sortBy, order] = e.target.value.split(':') as [
                      'createdAt' | 'updatedAt' | 'priority' | 'status' | 'title',
                      'asc' | 'desc',
                    ];
                    setParams((prev) => ({
                      ...prev,
                      sortBy,
                      order,
                      page: 1,
                    }));
                  }}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="createdAt:desc">Newest First</option>
                  <option value="createdAt:asc">Oldest First</option>
                  <option value="updatedAt:desc">Recently Updated</option>
                  <option value="priority:desc">Priority (High-Low)</option>
                  <option value="status:asc">Status</option>
                  <option value="title:asc">Title (A-Z)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tickets Table / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm text-slate-600">
              Loading all Tickets...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <p className="mt-2 text-sm font-semibold text-rose-800">{error}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Filter className="h-10 w-10 text-slate-300" />
            <h2 className="mt-3 text-base font-semibold text-slate-900">
              No Tickets found
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {hasActiveFilters
                ? 'No Tickets match the active filter criteria.'
                : 'No support Tickets have been submitted yet.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ticket
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Submitter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {tickets.map((ticket) => {
                    const submitter = getTicketSubmitter(ticket);
                    const isRowUpdating = updatingId === ticket._id;
                    return (
                      <tr
                        key={ticket._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="max-w-xs px-4 py-3.5">
                          <Link
                            to={`/tickets/${ticket._id}`}
                            className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-600"
                          >
                            {ticket.title}
                          </Link>
                          <span className="font-mono text-[11px] text-slate-400">
                            #{ticket._id.slice(-6).toUpperCase()}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <div className="text-sm font-medium text-slate-800">
                            {submitter.name}
                          </div>
                          {submitter.email && (
                            <div className="text-xs text-slate-500">
                              {submitter.email}
                            </div>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {ticket.category}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <select
                            aria-label={`Status for ${ticket.title}`}
                            value={ticket.status}
                            disabled={isRowUpdating}
                            onChange={(e) =>
                              void handleInlineStatus(
                                ticket._id,
                                e.target.value as TicketStatus
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                          >
                            {TICKET_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <select
                            aria-label={`Priority for ${ticket.title}`}
                            value={ticket.priority}
                            disabled={isRowUpdating}
                            onChange={(e) =>
                              void handleInlinePriority(
                                ticket._id,
                                e.target.value as TicketPriority
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                          >
                            {TICKET_PRIORITIES.map((priority) => (
                              <option key={priority} value={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <Link
                            to={`/tickets/${ticket._id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-50"
                          >
                            View
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="divide-y divide-slate-200 md:hidden">
              {tickets.map((ticket) => {
                const submitter = getTicketSubmitter(ticket);
                const isRowUpdating = updatingId === ticket._id;
                return (
                  <div key={ticket._id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
                        >
                          {ticket.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Submitter: {submitter.name} • {ticket.category}
                        </p>
                      </div>
                      <Link
                        to={`/tickets/${ticket._id}`}
                        className="shrink-0 text-xs font-medium text-indigo-600"
                      >
                        Open →
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <select
                        aria-label={`Mobile status for ${ticket.title}`}
                        value={ticket.status}
                        disabled={isRowUpdating}
                        onChange={(e) =>
                          void handleInlineStatus(
                            ticket._id,
                            e.target.value as TicketStatus
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                      >
                        {TICKET_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <select
                        aria-label={`Mobile priority for ${ticket.title}`}
                        value={ticket.priority}
                        disabled={isRowUpdating}
                        onChange={(e) =>
                          void handleInlinePriority(
                            ticket._id,
                            e.target.value as TicketPriority
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                      >
                        {TICKET_PRIORITIES.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={(nextPage) =>
                setParams((prev) => ({ ...prev, page: nextPage }))
              }
            />
          </div>
        )}
      </div>
    </Layout>
  );
};
