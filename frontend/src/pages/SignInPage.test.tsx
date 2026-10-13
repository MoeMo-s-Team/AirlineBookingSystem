import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SignInPage } from './SignInPage';
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

describe('SignInPage', () => {
  const mockSignIn = vi.fn();
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      profileError: null,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: mockSignOut,
      refreshProfile: vi.fn(),
    });
  });

  it('signs in with email only and navigates based on returned role (ADMIN -> /admin/flights)', async () => {
    mockSignIn.mockResolvedValue({
      id: 'admin-id',
      email: 'admin@airline.com',
      fullName: 'Admin User',
      role: 'ADMIN',
    });

    render(
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In to Account/i });

    fireEvent.change(emailInput, { target: { value: 'admin@airline.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('admin@airline.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/flights', { replace: true });
    });
  });

  it('navigates to /my-bookings when returned role is CUSTOMER, even if email has "admin"', async () => {
    mockSignIn.mockResolvedValue({
      id: 'cust-id',
      email: 'notanadmin@airline.com',
      fullName: 'Regular Customer',
      role: 'CUSTOMER',
    });

    render(
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'notanadmin@airline.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In to Account/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('notanadmin@airline.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/my-bookings', { replace: true });
    });
  });

  it('displays error message when signIn fails', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid login credentials'));

    render(
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In to Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid login credentials/i)).toBeInTheDocument();
    });
  });
});
