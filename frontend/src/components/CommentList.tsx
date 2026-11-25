import React, { useState } from 'react';
import {
  AlertCircle,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { extractApiError } from '../api/axios';
import { getCommentAuthor, type Comment } from '../types';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  onAddComment: (body: string) => Promise<void>;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  loading,
  error,
  submitting,
  onAddComment,
}) => {
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setFormError('Please enter a comment before posting.');
      return;
    }

    setFormError(null);
    try {
      await onAddComment(body.trim());
      setBody('');
    } catch (err) {
      setFormError(extractApiError(err, 'Failed to post comment.').message);
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-700">
            No comments yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add a comment below to share an update or ask a question.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const author = getCommentAuthor(comment);
            const isAdminAuthor = author.role === 'admin';
            const timestamp = new Date(comment.createdAt).toLocaleString(
              undefined,
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }
            );

            return (
              <div
                key={comment._id}
                className={`rounded-xl border p-4 ${
                  isAdminAuthor
                    ? 'border-indigo-200 bg-indigo-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        isAdminAuthor
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {author.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {author.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        isAdminAuthor
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isAdminAuthor && <ShieldCheck className="h-3 w-3" />}
                      {isAdminAuthor ? 'Admin' : 'Submitter'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{timestamp}</span>
                </div>

                <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {comment.body}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
      >
        <label
          htmlFor="new-comment-body"
          className="block text-sm font-medium text-slate-700"
        >
          Add a Comment
        </label>

        {formError && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <textarea
          id="new-comment-body"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply..."
          className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Post Comment
          </button>
        </div>
      </form>
    </div>
  );
};
