import React from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { TicketPriority } from '../types';

const PRIORITY_STYLES: Record<
  TicketPriority,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  Low: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: <ArrowDown className="h-3 w-3" />,
  },
  Medium: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <Minus className="h-3 w-3" />,
  },
  High: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: <ArrowUp className="h-3 w-3" />,
  },
  Critical: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'sm',
}) => {
  const style = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.Medium;
  const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${style.bg} ${style.text} ${style.border} ${padding}`}
    >
      {style.icon}
      {priority}
    </span>
  );
};
