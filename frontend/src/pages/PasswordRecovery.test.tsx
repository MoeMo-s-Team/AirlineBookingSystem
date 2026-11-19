import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

vi.mock('../lib/supabase', () => ({ supabase: { auth: { resetPasswordForEmail: vi.fn(), updateUser: vi.fn() } } }));
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../components/layout/TopNavBar', () => ({ TopNavBar: () => null }));
vi.mock('../components/layout/Footer', () => ({ Footer: () => null }));
const completePasswordRecovery = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({ user: null, isAuthenticated: true, isPasswordRecovery: true, completePasswordRecovery,
    isLoading: false, isAdmin: false, profileError: null, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), refreshProfile: vi.fn() });
});

describe('password recovery', () => {
  it('requests an email through Supabase with a same-origin reset redirect', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null });
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox', { name: /Email/i }), { target: { value: 'owner@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    await waitFor(() => expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('owner@example.com', {
      redirectTo: `${window.location.origin}/reset-password`,
    }));
    expect(await screen.findByRole('status')).toHaveTextContent('If an account exists for this email');
  });

  it('shows email delivery errors without a false success', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockRejectedValue(new Error('Email rate limit exceeded'));
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox', { name: /Email/i }), { target: { value: 'owner@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email rate limit exceeded');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('updates the password in Supabase and clears the recovery flow only after success', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({ data: { user: {} as any }, error: null });
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'NewPassword123' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'NewPassword123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Your password has been updated.');
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'NewPassword123' });
    expect(completePasswordRecovery).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });

  it('rejects mismatching passwords without an API call', () => {
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'NewPassword123' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'OtherPassword123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.');
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it('rejects a normal signed-in session without a recovery flow', () => {
    vi.mocked(useAuth).mockReturnValue({ ...useAuth(), isPasswordRecovery: false });
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    expect(screen.getByRole('alert')).toHaveTextContent('This recovery link is invalid or expired.');
    expect(screen.queryByRole('button', { name: 'Update password' })).not.toBeInTheDocument();
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it('rejects an expired link even when a previous recovery session still exists', () => {
    render(<MemoryRouter initialEntries={['/reset-password#error=access_denied&error_code=otp_expired']}><ResetPasswordPage /></MemoryRouter>);
    expect(screen.getByRole('alert')).toHaveTextContent('This recovery link is invalid or expired.');
    expect(screen.queryByRole('button', { name: 'Update password' })).not.toBeInTheDocument();
  });

  it('preserves the recovery flow when Supabase rejects the password update', async () => {
    vi.mocked(supabase.auth.updateUser).mockRejectedValue(new Error('Password does not meet requirements'));
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'NewPassword123' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'NewPassword123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Password does not meet requirements');
    expect(completePasswordRecovery).not.toHaveBeenCalled();
  });
});
