import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';
import { CustomerRoute } from './CustomerRoute';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Route Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AdminRoute', () => {
    it('shows loading view without redirecting while isLoading is true', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: true,
        profileError: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/admin/flights']}>
          <Routes>
            <Route path="/admin/flights" element={<AdminRoute><div>Admin Content</div></AdminRoute>} />
            <Route path="/sign-in" element={<div>Sign In Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Verifying Admin Authorization/i)).toBeInTheDocument();
      expect(screen.queryByText('Sign In Page')).not.toBeInTheDocument();
    });

    it('redirects to /sign-in when unauthenticated and not loading', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        profileError: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/admin/flights']}>
          <Routes>
            <Route path="/admin/flights" element={<AdminRoute><div>Admin Content</div></AdminRoute>} />
            <Route path="/sign-in" element={<div>Sign In Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Sign In Page')).toBeInTheDocument();
    });

    it('renders Access Denied when authenticated as CUSTOMER', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'c-1', email: 'c@airline.com', fullName: 'Customer', role: 'CUSTOMER' },
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false,
        profileError: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/admin/flights']}>
          <Routes>
            <Route path="/admin/flights" element={<AdminRoute><div>Admin Content</div></AdminRoute>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Restricted Admin Area/i)).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('renders children when authenticated as ADMIN', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'a-1', email: 'a@airline.com', fullName: 'Admin', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true,
        isLoading: false,
        profileError: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/admin/flights']}>
          <Routes>
            <Route path="/admin/flights" element={<AdminRoute><div>Admin Content</div></AdminRoute>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  describe('CustomerRoute', () => {
    it('redirects to /admin/flights when authenticated as ADMIN', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'a-1', email: 'a@airline.com', fullName: 'Admin', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true,
        isLoading: false,
        profileError: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        refreshProfile: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/my-bookings']}>
          <Routes>
            <Route path="/my-bookings" element={<CustomerRoute><div>Customer Content</div></CustomerRoute>} />
            <Route path="/admin/flights" element={<div>Admin Flights Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Flights Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Customer Content')).not.toBeInTheDocument();
    });
  });
});
