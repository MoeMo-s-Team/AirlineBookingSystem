import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface CustomerRouteProps {
  readonly children: React.ReactNode;
}

/**
 * Ensures that if an admin is logged in, they are redirected to /admin/flights
 * and do not see the customer-facing booking interface.
 * Regular customers and guests can access the customer interface freely.
 */
export const CustomerRoute: React.FC<CustomerRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // If an Admin is logged in, isolate them to the Ops Console
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/flights" replace />;
  }

  return <>{children}</>;
};
