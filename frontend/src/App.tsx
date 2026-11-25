import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PrivateRoute } from './components/PrivateRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminTicketsPage } from './pages/AdminTicketsPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TicketDetailPage } from './pages/TicketDetailPage';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
      replace
    />
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/tickets/new"
            element={
              <PrivateRoute>
                <CreateTicketPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/tickets/:id"
            element={
              <PrivateRoute>
                <TicketDetailPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/tickets"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminTicketsPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
