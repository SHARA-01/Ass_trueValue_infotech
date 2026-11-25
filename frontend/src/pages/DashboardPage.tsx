import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpDown,
  Filter,
  Inbox,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Pagination } from '../components/Pagination';
import { TicketCard } from '../components/TicketCard';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../hooks/useTickets';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
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
  } = useTickets({ admin: false });

  const [searchInput, setSearchInput] = useState(params.search ?? '');

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
    params.status || params.priority || params.category || params.search
  );

  const clearFilters = () => {
    setSearchInput('');
    setParams((prev) => ({
      ...prev,
      page: 1,
      status: '',
      priority: '',
      category: '',
      search: '',
    }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Tickets
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome back, <span className="font-medium">{user?.name}</span>.
              Track and manage your submitted support Tickets.
            </p>
          </div>

          <Link
            to="/tickets/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </Link>
        </div>

        {/* Status Summary & Quick Filter Strip */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <button
            type="button"
            onClick={() =>
              setParams((prev) => ({ ...prev, status: '', page: 1 }))
            }
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              !params.status
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Tickets
            {!params.status && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[11px]">
                {total}
              </span>
            )}
          </button>

          {TICKET_STATUSES.map((status) => {
            const active = params.status === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setParams((prev) => ({
                    ...prev,
                    status: active ? '' : (status as TicketStatus),
                    page: 1,
                  }))
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {status}
                {active && (
                  <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[11px]">
                    {total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Controls */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title or description..."
                className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
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
                {TICKET_PRIORITIES.map((prio) => (
                  <option key={prio} value={prio}>
                    {prio}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
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
                {TICKET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                  <option value="title:asc">Title (A-Z)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  title="Clear filters"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ticket List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm text-slate-600">Loading your Tickets...</p>
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
            {hasActiveFilters ? (
              <>
                <Filter className="h-10 w-10 text-slate-300" />
                <h2 className="mt-3 text-base font-semibold text-slate-900">
                  No matching Tickets
                </h2>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Try adjusting your search query or filters to find what
                  you&apos;re looking for.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <Inbox className="h-10 w-10 text-slate-300" />
                <h2 className="mt-3 text-base font-semibold text-slate-900">
                  No Tickets submitted yet
                </h2>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Need help with technical support, billing, or a bug report?
                  Create your first Ticket to get started.
                </p>
                <Link
                  to="/tickets/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Ticket
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
          </div>
        )}
      </div>
    </Layout>
  );
};
