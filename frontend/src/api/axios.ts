import axios, { AxiosError } from 'axios';
import type { ApiFieldError, ApiResponse } from '../types';

export const TOKEN_STORAGE_KEY = 'stm_auth_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isAuthAttempt =
      url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  }
);

export interface ExtractedApiError {
  message: string;
  fieldErrors: Record<string, string>;
  errors: ApiFieldError[];
}

export function extractApiError(
  err: unknown,
  fallbackMessage = 'Something went wrong. Please try again.'
): ExtractedApiError {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiResponse<unknown> | undefined;
    const errors = Array.isArray(data?.errors) ? data.errors : [];
    const fieldErrors: Record<string, string> = {};

    for (const item of errors) {
      if (item.field && item.message && !fieldErrors[item.field]) {
        fieldErrors[item.field] = item.message;
      }
    }

    const message =
      data?.message ||
      (errors.length > 0 ? errors.map((e) => e.message).join('. ') : null) ||
      err.message ||
      fallbackMessage;

    return { message, fieldErrors, errors };
  }

  if (err instanceof Error) {
    return { message: err.message, fieldErrors: {}, errors: [] };
  }

  return { message: fallbackMessage, fieldErrors: {}, errors: [] };
}

export default api;
