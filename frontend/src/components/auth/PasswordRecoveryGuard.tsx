import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Recovery sessions must reach the password form before normal role redirects. */
export function PasswordRecoveryGuard({ children }: { children: ReactNode }) {
  const { isPasswordRecovery, isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  if (isAuthenticated && isPasswordRecovery && pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }
  return children;
}
