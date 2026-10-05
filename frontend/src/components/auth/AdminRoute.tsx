import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface AdminRouteProps {
  readonly children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[36px] text-primary animate-spin">
            progress_activity
          </span>
          <span className="text-label-md font-semibold text-primary">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to unified Sign In
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Logged in as customer -> Access Denied / Unauthorized for Admin Portal
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-container-lowest border border-error/30 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h1 className="text-headline-md font-bold text-error tracking-tight">
            Restricted Admin Area
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-2 mb-6">
            Account <strong>{user?.email}</strong> is registered as a passenger and does not have Flight Operations or Dispatcher privileges.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/sign-in"
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-bold hover:bg-primary-container transition-colors"
            >
              Sign In With Admin Account
            </a>
            <a
              href="/"
              className="w-full py-2.5 rounded-xl border border-outline-variant text-primary text-label-md font-semibold hover:bg-surface-container transition-colors"
            >
              Return to SkyWing Flights
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
