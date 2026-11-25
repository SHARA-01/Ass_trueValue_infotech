import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderOpen,
  Inbox,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAdminStats } from '../hooks/useTickets';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from '../types';

const STATUS_BAR_COLORS: Record<string, string> = {
  Open: 'bg-sky-500',
  'In-Progress': 'bg-indigo-500',
  'On-Hold': 'bg-amber-500',
  Resolved: 'bg-emerald-500',
  Closed: 'bg-slate-400',
};

const PRIORITY_BAR_COLORS: Record<string, string> = {
  Low: 'bg-slate-400',
  Medium: 'bg-blue-500',
  High: 'bg-orange-500',
  Critical: 'bg-rose-500',
};

export const AdminDashboardPage: React.FC = () => {
  const { stats, loading, error, refetch } = useAdminStats();

  const total = stats?.total ?? 0;
  const openCount = stats?.byStatus?.['Open'] ?? 0;
  const inProgressCount = stats?.byStatus?.['In-Progress'] ?? 0;
  const resolvedCount = stats?.byStatus?.['Resolved'] ?? 0;
  const criticalCount = stats?.byPriority?.['Critical'] ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              System-wide overview of all Tickets across Status, Priority, and
              Category.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link
              to="/admin/tickets"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Manage All Tickets
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm text-slate-600">
              Loading Ticket statistics...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
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
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Link
                to="/admin/tickets"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Tickets
                  </span>
                  <Inbox className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">{total}</p>
              </Link>

              <Link
                to="/admin/tickets?status=Open"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    Open
                  </span>
                  <FolderOpen className="h-5 w-5 text-sky-500" />
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {openCount}
                </p>
              </Link>

              <Link
                to="/admin/tickets?status=In-Progress"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    In-Progress
                  </span>
                  <Clock className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {inProgressCount}
                </p>
              </Link>

              <Link
                to="/admin/tickets?status=Resolved"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Resolved
                  </span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {resolvedCount}
                </p>
              </Link>

              <Link
                to="/admin/tickets?priority=Critical"
                className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm transition hover:border-rose-300 hover:shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                    Critical
                  </span>
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                </div>
                <p className="mt-2 text-3xl font-bold text-rose-700">
                  {criticalCount}
                </p>
              </Link>
            </div>

            {/* Breakdown Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* By Status */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  Tickets by Status
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Click any status to filter All Tickets
                </p>

                <div className="mt-5 space-y-4">
                  {TICKET_STATUSES.map((status) => {
                    const count = stats?.byStatus?.[status] ?? 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <Link
                        key={status}
                        to={`/admin/tickets?status=${encodeURIComponent(status)}`}
                        className="group block"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700 group-hover:text-indigo-600">
                            {status}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              STATUS_BAR_COLORS[status] ?? 'bg-indigo-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* By Priority */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  Tickets by Priority
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Click any priority level to inspect
                </p>

                <div className="mt-5 space-y-4">
                  {TICKET_PRIORITIES.map((priority) => {
                    const count = stats?.byPriority?.[priority] ?? 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <Link
                        key={priority}
                        to={`/admin/tickets?priority=${encodeURIComponent(priority)}`}
                        className="group block"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700 group-hover:text-indigo-600">
                            {priority}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              PRIORITY_BAR_COLORS[priority] ?? 'bg-indigo-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* By Category */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  Tickets by Category
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Click any category to filter queue
                </p>

                <div className="mt-5 space-y-4">
                  {TICKET_CATEGORIES.map((category) => {
                    const count = stats?.byCategory?.[category] ?? 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <Link
                        key={category}
                        to={`/admin/tickets?category=${encodeURIComponent(category)}`}
                        className="group block"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate font-medium text-slate-700 group-hover:text-indigo-600">
                            {category}
                          </span>
                          <span className="ml-2 shrink-0 text-xs font-semibold text-slate-600">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
