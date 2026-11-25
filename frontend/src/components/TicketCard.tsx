import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Tag, User as UserIcon } from 'lucide-react';
import { getTicketSubmitter, type Ticket } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

interface TicketCardProps {
  ticket: Ticket;
  showSubmitter?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  showSubmitter = false,
}) => {
  const submitter = getTicketSubmitter(ticket);
  const createdDate = new Date(ticket.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/tickets/${ticket._id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              <Tag className="h-3 w-3 text-slate-400" />
              {ticket.category}
            </span>
          </div>

          <h3 className="truncate text-base font-semibold text-slate-900 transition group-hover:text-indigo-600">
            {ticket.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
            {ticket.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end text-xs font-medium text-indigo-600 sm:self-center">
          <span>View Ticket</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          Created {createdDate}
        </span>

        {showSubmitter && (
          <span className="inline-flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
            Submitter: <strong className="font-medium text-slate-700">{submitter.name}</strong>
          </span>
        )}

        <span className="font-mono text-[11px] text-slate-400">
          #{ticket._id.slice(-6).toUpperCase()}
        </span>
      </div>
    </Link>
  );
};
