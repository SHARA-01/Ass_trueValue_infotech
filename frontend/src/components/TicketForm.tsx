import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { extractApiError } from '../api/axios';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type TicketCategory,
  type TicketPriority,
} from '../types';

export interface TicketFormValues {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

interface TicketFormProps {
  initialValues?: Partial<TicketFormValues>;
  submitLabel?: string;
  onSubmit: (values: TicketFormValues) => Promise<void>;
  onCancel?: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  initialValues,
  submitLabel = 'Submit Ticket',
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [category, setCategory] = useState<TicketCategory>(
    initialValues?.category ?? 'Technical Support'
  );
  const [priority, setPriority] = useState<TicketPriority>(
    initialValues?.priority ?? 'Medium'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextFieldErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextFieldErrors.title = 'Title is required.';
    } else if (title.trim().length > 200) {
      nextFieldErrors.title = 'Title must be at most 200 characters.';
    }

    if (!description.trim()) {
      nextFieldErrors.description = 'Description is required.';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });
    } catch (err) {
      const parsed = extractApiError(err, 'Failed to save ticket.');
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="ticket-title"
          className="block text-sm font-medium text-slate-700"
        >
          Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="ticket-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary of the issue or request"
          className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            fieldErrors.title
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
          }`}
        />
        {fieldErrors.title && (
          <p className="mt-1 text-xs text-rose-600">{fieldErrors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="ticket-category"
            className="block text-sm font-medium text-slate-700"
          >
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="ticket-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {TICKET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {fieldErrors.category && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.category}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="ticket-priority"
            className="block text-sm font-medium text-slate-700"
          >
            Priority
          </label>
          <select
            id="ticket-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {TICKET_PRIORITIES.map((prio) => (
              <option key={prio} value={prio}>
                {prio}
              </option>
            ))}
          </select>
          {fieldErrors.priority && (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.priority}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="ticket-description"
          className="block text-sm font-medium text-slate-700"
        >
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="ticket-description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide steps to reproduce, expected behavior, or relevant context..."
          className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            fieldErrors.description
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
          }`}
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-rose-600">
            {fieldErrors.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};
