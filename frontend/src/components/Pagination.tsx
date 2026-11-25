import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (nextPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}) => {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:px-6">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium text-slate-900">{start}</span> to{' '}
        <span className="font-medium text-slate-900">{end}</span> of{' '}
        <span className="font-medium text-slate-900">{total}</span>{' '}
        {total === 1 ? 'Ticket' : 'Tickets'}
      </p>

      {totalPages > 1 && (
        <nav className="inline-flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          {pages.map((item, idx) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-sm text-slate-400"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`min-w-[2.25rem] rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                  item === page
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
};
