import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SignUpPage } from './SignUpPage';
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

describe('SignUpPage', () => {
  const mockSignUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      profileError: null,
      signIn: vi.fn(),
      signUp: mockSignUp,
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    });
  });

  it('shows confirmation instructions and does not navigate when confirmationRequired is true', async () => {
    mockSignUp.mockResolvedValue({ confirmationRequired: true });

    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Nguyen Van A' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'a@example.com' } });
    fireEvent.change(screen.getByLabelText(/Create Secure Password/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('Nguyen Van A', 'a@example.com', '12345678');
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText(/Vui lòng kiểm tra email để xác nhận tài khoản/i)).toBeInTheDocument();
    });
  });

  it('navigates immediately to /my-bookings when confirmation is disabled (immediate session)', async () => {
    mockSignUp.mockResolvedValue({ confirmationRequired: false });

    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Nguyen Van B' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'b@example.com' } });
    fireEvent.change(screen.getByLabelText(/Create Secure Password/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/my-bookings');
    });
  });
});
