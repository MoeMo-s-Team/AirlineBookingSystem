import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GoogleSignInButton } from './GoogleSignInButton';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({ supabase: { auth: { signInWithOAuth: vi.fn() } } }));
beforeEach(() => vi.clearAllMocks());

it('starts Google OAuth and preserves a local booking return URL', async () => {
  vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({ data: { provider: 'google', url: 'https://accounts.google.com/' }, error: null });
  render(<MemoryRouter initialEntries={['/sign-in?returnTo=%2Fflights%3Forigin%3DSGN']}><GoogleSignInButton /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
  await waitFor(() => expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'google', options: {
    redirectTo: `${window.location.origin}/auth/callback?returnTo=%2Fflights%3Forigin%3DSGN`,
  } }));
});

it('does not carry an external return URL into OAuth', async () => {
  vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({ data: { provider: 'google', url: 'https://accounts.google.com/' }, error: null });
  render(<MemoryRouter initialEntries={['/sign-in?returnTo=https%3A%2F%2Fevil.example']}><GoogleSignInButton /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
  await waitFor(() => expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'google', options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  } }));
});

it('shows provider errors and permits retry', async () => {
  vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(new Error('Google provider is disabled'));
  render(<MemoryRouter><GoogleSignInButton /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Google provider is disabled');
  expect(screen.getByRole('button', { name: 'Continue with Google' })).not.toBeDisabled();
});
