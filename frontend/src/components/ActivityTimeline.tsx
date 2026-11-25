import React from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Loader2,
  MessageSquarePlus,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { getActivityActor, type ActivityLog } from '../types';

interface ActivityTimelineProps {
  logs: ActivityLog[];
  loading: boolean;
  error: string | null;
}

const EVENT_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  'ticket.created': {
    label: 'Ticket Created',
    icon: <PlusCircle className="h-4 w-4 text-sky-600" />,
    badgeClass: 'bg-sky-50 border-sky-200',
  },
  'ticket.updated': {
    label: 'Ticket Updated',
    icon: <Edit3 className="h-4 w-4 text-indigo-600" />,
    badgeClass: 'bg-indigo-50 border-indigo-200',
  },
  'ticket.status_changed': {
    label: 'Status Changed',
    icon: <RefreshCw className="h-4 w-4 text-amber-600" />,
    badgeClass: 'bg-amber-50 border-amber-200',
  },
  'ticket.resolved': {
    label: 'Ticket Resolved',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    badgeClass: 'bg-emerald-50 border-emerald-200',
  },
  'comment.added': {
    label: 'Comment Added',
    icon: <MessageSquarePlus className="h-4 w-4 text-violet-600" />,
    badgeClass: 'bg-violet-50 border-violet-200',
  },
};

function formatMetadata(metadata?: Record<string, unknown>): string | null {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  if (
    typeof metadata.from === 'string' &&
    typeof metadata.to === 'string'
  ) {
    return `${metadata.from} → ${metadata.to}`;
  }

  if (
    typeof metadata.previousStatus === 'string' &&
    typeof metadata.newStatus === 'string'
  ) {
    return `${metadata.previousStatus} → ${metadata.newStatus}`;
  }

  if (
    typeof metadata.previousPriority === 'string' &&
    typeof metadata.newPriority === 'string'
  ) {
    return `Priority: ${metadata.previousPriority} → ${metadata.newPriority}`;
  }

  const entries = Object.entries(metadata)
    .filter(([, val]) => val !== undefined && val !== null)
    .map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}`);

  return entries.length > 0 ? entries.join(' • ') : null;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  logs,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
        <Activity className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-sm font-medium text-slate-700">
          No activity recorded yet
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Events for this Ticket will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative ml-3 space-y-6 border-l border-slate-200 pl-6">
      {logs.map((log) => {
        const actor = getActivityActor(log);
        const config = EVENT_CONFIG[log.event] ?? {
          label: log.event,
          icon: <Activity className="h-4 w-4 text-slate-600" />,
          badgeClass: 'bg-slate-50 border-slate-200',
        };
        const metaText = formatMetadata(log.metadata);
        const timestamp = new Date(log.createdAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });

        return (
          <li key={log._id} className="relative">
            <span
              className={`absolute -left-[37px] flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow-sm ${config.badgeClass}`}
            >
              {config.icon}
            </span>

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {config.label}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                    {log.event}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{timestamp}</span>
              </div>

              <p className="mt-1 text-xs text-slate-600">
                Performed by{' '}
                <span className="font-medium text-slate-800">{actor.name}</span>
                {actor.role && (
                  <span className="ml-1 text-slate-400">
                    ({actor.role === 'admin' ? 'Admin' : 'User'})
                  </span>
                )}
              </p>

              {metaText && (
                <p className="mt-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                  {metaText}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
