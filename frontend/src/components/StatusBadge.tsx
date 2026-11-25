import React from 'react';
import type { TicketStatus } from '../types';

const STATUS_STYLES: Record<
  TicketStatus,
  { bg: string; text: string; dot: string; border: string }
> = {
  Open: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    border: 'border-sky-200',
  },
  'In-Progress': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    border: 'border-indigo-200',
  },
  'On-Hold': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  Resolved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  Closed: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
  },
};

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Open;
  const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${style.bg} ${style.text} ${style.border} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};
