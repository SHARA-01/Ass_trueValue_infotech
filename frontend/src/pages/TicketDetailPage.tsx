import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Tag,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { extractApiError } from '../api/axios';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { CommentList } from '../components/CommentList';
import { Layout } from '../components/Layout';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { TicketForm, type TicketFormValues } from '../components/TicketForm';
import { useAuth } from '../contexts/AuthContext';
import { useComments } from '../hooks/useComments';
import { useTicketDetail } from '../hooks/useTickets';
import {
  getTicketSubmitter,
  getTicketSubmitterId,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from '../types';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    ticket,
    activity,
    loading,
    activityLoading,
    error,
    activityError,
    refetchActivity,
    updateTicket,
    deleteTicket,
    updateStatus,
    updatePriority,
  } = useTicketDetail(id);

  const {
    comments,
    loading: commentsLoading,
    submitting: commentSubmitting,
    error: commentsError,
    addComment,
  } = useComments(id);

  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>(
    'comments'
  );
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adminUpdating, setAdminUpdating] = useState<
    'status' | 'priority' | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const backPath = isAdmin ? '/admin/tickets' : '/dashboard';
  const backLabel = isAdmin ? 'Back to All Tickets' : 'Back to My Tickets';

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm text-slate-600">
            Loading Ticket details...
          </p>
        </div>
      </Layout>
    );
  }

  if (error || !ticket) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl space-y-4">
          <Link
            to={backPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
            <h1 className="mt-2 text-lg font-semibold text-rose-900">
              Unable to load Ticket
            </h1>
            <p className="mt-1 text-sm text-rose-700">
              {error ?? 'Ticket not found.'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const submitterId = getTicketSubmitterId(ticket);
  const isSubmitter = Boolean(user?._id && submitterId === user._id);
  const canDelete = isSubmitter && ticket.status === 'Open';
  const submitter = getTicketSubmitter(ticket);

  const handleEditSubmit = async (values: TicketFormValues) => {
    await updateTicket(values);
    setEditing(false);
    setActionSuccess('Ticket updated successfully.');
    setActionError(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setActionError(null);
    try {
      await deleteTicket();
      navigate(backPath, { replace: true });
    } catch (err) {
      setActionError(extractApiError(err, 'Failed to delete Ticket.').message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleStatusChange = async (nextStatus: TicketStatus) => {
    if (nextStatus === ticket.status) return;
    setAdminUpdating('status');
    setActionError(null);
    setActionSuccess(null);
    try {
      await updateStatus(nextStatus);
      setActionSuccess(`Status updated to ${nextStatus}.`);
    } catch (err) {
      setActionError(extractApiError(err, 'Failed to update Status.').message);
    } finally {
      setAdminUpdating(null);
    }
  };

  const handlePriorityChange = async (nextPriority: TicketPriority) => {
    if (nextPriority === ticket.priority) return;
    setAdminUpdating('priority');
    setActionError(null);
    setActionSuccess(null);
    try {
      await updatePriority(nextPriority);
      setActionSuccess(`Priority updated to ${nextPriority}.`);
    } catch (err) {
      setActionError(
        extractApiError(err, 'Failed to update Priority.').message
      );
    } finally {
      setAdminUpdating(null);
    }
  };

  const handleAddComment = async (body: string) => {
    await addComment(body);
    void refetchActivity();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back link & actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={backPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {isSubmitter && !editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setActionSuccess(null);
                  setActionError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Edit3 className="h-4 w-4" />
                Edit Ticket
              </button>
            )}

            {canDelete && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
              >
                <Trash2 className="h-4 w-4" />
                Delete Ticket
              </button>
            )}
          </div>
        </div>

        {/* Delete confirmation banner */}
        {confirmDelete && (
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-rose-900">
                Delete this Open Ticket?
              </p>
              <p className="mt-0.5 text-xs text-rose-700">
                This action cannot be undone. Only Open Tickets can be deleted by
                their Submitter.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {actionError && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {actionSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Primary Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Ticket Card or Inline Edit Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {editing ? (
                <div>
                  <h2 className="mb-4 border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">
                    Edit Ticket
                  </h2>
                  <TicketForm
                    initialValues={{
                      title: ticket.title,
                      description: ticket.description,
                      category: ticket.category,
                      priority: ticket.priority,
                    }}
                    submitLabel="Save Changes"
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditing(false)}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={ticket.status} size="md" />
                    <PriorityBadge priority={ticket.priority} size="md" />
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                      <Tag className="h-3.5 w-3.5 text-slate-400" />
                      {ticket.category}
                    </span>
                    <span className="ml-auto font-mono text-xs text-slate-400">
                      #{ticket._id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    {ticket.title}
                  </h1>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Comments & Activity Log Tabs */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex border-b border-slate-200 bg-slate-50/70 px-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition ${
                    activeTab === 'comments'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Comments
                  <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs text-slate-700">
                    {comments.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('activity')}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition ${
                    activeTab === 'activity'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  Activity Log
                  <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs text-slate-700">
                    {activity.length}
                  </span>
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'comments' ? (
                  <CommentList
                    comments={comments}
                    loading={commentsLoading}
                    error={commentsError}
                    submitting={commentSubmitting}
                    onAddComment={handleAddComment}
                  />
                ) : (
                  <ActivityTimeline
                    logs={activity}
                    loading={activityLoading}
                    error={activityError}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Metadata & Admin Controls Sidebar */}
          <aside className="space-y-6">
            {isAdmin && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Admin Controls
                  </h2>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="admin-status-select"
                      className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      <span>Status</span>
                      {adminUpdating === 'status' && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                      )}
                    </label>
                    <select
                      id="admin-status-select"
                      value={ticket.status}
                      disabled={adminUpdating !== null}
                      onChange={(e) =>
                        void handleStatusChange(e.target.value as TicketStatus)
                      }
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                    >
                      {TICKET_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="admin-priority-select"
                      className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      <span>Priority</span>
                      {adminUpdating === 'priority' && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                      )}
                    </label>
                    <select
                      id="admin-priority-select"
                      value={ticket.priority}
                      disabled={adminUpdating !== null}
                      onChange={(e) =>
                        void handlePriorityChange(
                          e.target.value as TicketPriority
                        )
                      }
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                    >
                      {TICKET_PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Ticket Details Metadata Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
                Ticket Details
              </h2>

              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Submitter
                    </dt>
                    <dd className="font-semibold text-slate-900">
                      {submitter.name}
                    </dd>
                    {submitter.email && (
                      <dd className="text-xs text-slate-500">
                        {submitter.email}
                      </dd>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Created
                    </dt>
                    <dd className="text-slate-800">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">
                      Last Updated
                    </dt>
                    <dd className="text-slate-800">
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};
