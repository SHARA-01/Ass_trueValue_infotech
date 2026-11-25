import { useCallback, useEffect, useState } from 'react';
import api, { extractApiError } from '../api/axios';
import type { ApiResponse, Comment } from '../types';

export function useComments(ticketId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<Comment[]>>(
        `/tickets/${ticketId}/comments`
      );
      setComments(response.data.data ?? []);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load comments.').message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(
    async (body: string): Promise<Comment> => {
      if (!ticketId) throw new Error('Missing ticket ID');
      setSubmitting(true);
      try {
        const response = await api.post<ApiResponse<Comment>>(
          `/tickets/${ticketId}/comments`,
          { body }
        );
        const created = response.data.data;
        if (!created) {
          throw new Error(response.data.message || 'Failed to add comment');
        }
        setComments((prev) => [...prev, created]);
        return created;
      } finally {
        setSubmitting(false);
      }
    },
    [ticketId]
  );

  return {
    comments,
    loading,
    submitting,
    error,
    refetch: fetchComments,
    addComment,
  };
}
