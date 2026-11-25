import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Inbox,
  LifeBuoy,
  LogOut,
  Menu,
  PlusCircle,
  ShieldCheck,
  Ticket,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const renderNavLinks = (onNavigate?: () => void) => (
    <div className="space-y-1">
      {isAdmin && (
        <>
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Admin Console
          </p>
          <NavLink
            to="/admin/dashboard"
            className={navLinkClass}
            onClick={onNavigate}
          >
            <BarChart3 className="h-4 w-4" />
            Admin Dashboard
          </NavLink>
          <NavLink
            to="/admin/tickets"
            className={navLinkClass}
            onClick={onNavigate}
          >
            <Inbox className="h-4 w-4" />
            All Tickets
          </NavLink>
        </>
      )}

      <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Support Desk
      </p>
      <NavLink to="/dashboard" className={navLinkClass} onClick={onNavigate}>
        <Ticket className="h-4 w-4" />
        My Tickets
      </NavLink>
      <NavLink to="/tickets/new" className={navLinkClass} onClick={onNavigate}>
        <PlusCircle className="h-4 w-4" />
        Submit Ticket
      </NavLink>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6">
          <Link
            to={isAdmin ? '/admin/dashboard' : '/dashboard'}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-slate-900">
                TicketFlow
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Support Desk
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {renderNavLinks()}
        </nav>

        {user && (
          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isAdmin
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isAdmin
                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200'
                    : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
                }`}
              >
                {isAdmin ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  <UserIcon className="h-3.5 w-3.5" />
                )}
                {isAdmin ? 'Admin' : 'User'}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <Link
            to={isAdmin ? '/admin/dashboard' : '/dashboard'}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <LifeBuoy className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-slate-900">
              TicketFlow
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {user && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  isAdmin
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isAdmin ? 'Admin' : 'User'}
              </span>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
            {renderNavLinks(() => setMobileMenuOpen(false))}
            {user && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
