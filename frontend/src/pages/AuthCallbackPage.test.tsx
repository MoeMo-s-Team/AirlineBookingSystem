import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthCallbackPage } from './AuthCallbackPage';
import { useAuth } from '../context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state while bootstrap isLoading is true', () => {
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
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Đang xác thực tài khoản/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to /admin/flights when user is authenticated with ADMIN role', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'admin-1', email: 'admin@airline.com', fullName: 'Admin', role: 'ADMIN' },
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
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/flights', { replace: true });
    });
  });

  it('navigates to /my-bookings when user is authenticated with CUSTOMER role', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'cust-1', email: 'cust@airline.com', fullName: 'Customer', role: 'CUSTOMER' },
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
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/my-bookings', { replace: true });
    });
  });

  it('displays profile error when profile loading failed', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      profileError: { status: 403, code: 'PROFILE_ROLE_INVALID', message: 'Tài khoản chưa được kích hoạt vai trò hợp lệ' },
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Tài khoản chưa được kích hoạt vai trò hợp lệ/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
