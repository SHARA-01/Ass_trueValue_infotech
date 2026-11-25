import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  LifeBuoy,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { extractApiError } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Full name is required.';
    if (!email.trim()) nextErrors.email = 'Email is required.';
    if (!password || password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError('Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const createdUser = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      navigate(
        createdUser.role === 'admin' ? '/admin/dashboard' : '/dashboard',
        { replace: true }
      );
    } catch (err) {
      const parsed = extractApiError(err, 'Unable to create account.');
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
          Create your account
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-600">
          Join TicketFlow to submit and track support Tickets
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reg-name"
                className="block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <div className="relative mt-1.5">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className={`block w-full rounded-lg border bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    fieldErrors.name
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
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
                htmlFor="reg-password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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

            {/* Role selector for demo/evaluation */}
            <div className="pt-1">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-slate-700">
                  Account Role
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Demo / Evaluation Selector
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                    role === 'user'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <UserIcon className="h-4 w-4 text-slate-600" />
                    User
                  </div>
                  <span className="mt-0.5 text-xs text-slate-500">
                    Submit &amp; track own Tickets
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                    role === 'admin'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    Admin
                  </div>
                  <span className="mt-0.5 text-xs text-slate-500">
                    Manage all Tickets &amp; stats
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
