import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/profileApi';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../api/profileApi', () => ({ profileApi: { get: vi.fn(), update: vi.fn() } }));
vi.mock('../components/layout/TopNavBar', () => ({ TopNavBar: () => null }));
vi.mock('../components/layout/Footer', () => ({ Footer: () => null }));

const profile = { id: 'owner', email: 'owner@example.com', fullName: 'Owner Name', role: 'CUSTOMER' as const,
  phone: '0901234567', dateOfBirth: '1990-01-01', passportNo: 'AB12345' };
const refreshProfile = vi.fn();

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: profile, isAuthenticated: true, isLoading: false, refreshProfile,
      isAdmin: false, profileError: null, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
      isPasswordRecovery: false, completePasswordRecovery: vi.fn() });
    vi.mocked(profileApi.get).mockResolvedValue(profile);
  });

  it('loads and saves editable details without sending role, email or user ID', async () => {
    vi.mocked(profileApi.update).mockResolvedValue({ ...profile, fullName: 'New Name' });
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    const name = await screen.findByDisplayValue('Owner Name');
    expect(screen.getByDisplayValue(profile.email)).toHaveAttribute('readonly');
    fireEvent.change(name, { target: { value: '  New Name  ' } });
    fireEvent.click(screen.getByRole('button', { name: /Save profile/i }));
    await waitFor(() => expect(profileApi.update).toHaveBeenCalledWith({
      fullName: 'New Name', phone: profile.phone, dateOfBirth: profile.dateOfBirth, passportNo: profile.passportNo,
    }));
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument();
    expect(refreshProfile).toHaveBeenCalledTimes(1);
  });

  it('keeps edited fields after a save failure', async () => {
    vi.mocked(profileApi.update).mockRejectedValue(new Error('Unable to save your profile.'));
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.change(await screen.findByDisplayValue('Owner Name'), { target: { value: 'Edited Name' } });
    fireEvent.click(screen.getByRole('button', { name: /Save profile/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save your profile.');
    expect(screen.getByDisplayValue('Edited Name')).toBeInTheDocument();
  });

  it('rejects invalid travel IDs before saving', async () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.change(await screen.findByDisplayValue('AB12345'), { target: { value: 'bad id!' } });
    fireEvent.click(screen.getByRole('button', { name: /Save profile/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Passport or national ID must contain 5 to 50 letters or digits.');
    expect(profileApi.update).not.toHaveBeenCalled();
  });

  it('redirects guests without requesting a private profile', async () => {
    vi.mocked(useAuth).mockReturnValue({ ...useAuth(), user: null, isAuthenticated: false });
    render(<MemoryRouter initialEntries={['/profile']}><Routes>
      <Route path="/profile" element={<ProfilePage />} /><Route path="/sign-in" element={<p>Sign in first</p>} />
    </Routes></MemoryRouter>);
    expect(await screen.findByText('Sign in first')).toBeInTheDocument();
    expect(profileApi.get).not.toHaveBeenCalled();
  });
});
