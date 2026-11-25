import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, LifeBuoy, Loader2, Lock, Mail } from 'lucide-react';
import { extractApiError } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!authLoading && user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
        replace
      />
    );
  }

  const fromPath = (location.state as { from?: { pathname?: string } } | null)
    ?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = 'Email is required.';
    if (!password) nextErrors.password = 'Password is required.';

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const loggedInUser = await login({
        email: email.trim(),
        password,
      });
      if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
        navigate(fromPath, { replace: true });
      } else {
        navigate(
          loggedInUser.role === 'admin' ? '/admin/dashboard' : '/dashboard',
          { replace: true }
        );
      }
    } catch (err) {
      const parsed = extractApiError(err, 'Invalid email or password.');
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to TicketFlow
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-600">
          Manage your support Tickets, replies, and activity logs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`block w-full rounded-lg border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full rounded-lg border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-rose-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
