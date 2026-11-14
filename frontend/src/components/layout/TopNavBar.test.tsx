import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { fullName: 'Test Customer' }, isAuthenticated: true, signOut }),
}));
vi.mock('../notification/NotificationBell', () => ({ NotificationBell: () => null }));

describe('TopNavBar sign out', () => {
  it.each([false, true])('opens sign-in after sign-out (remote failure: %s)', async (fails) => {
    if (fails) signOut.mockRejectedValueOnce(new Error('Network error'));
    else signOut.mockResolvedValueOnce(undefined);
    render(<MemoryRouter><Routes>
      <Route path="/" element={<TopNavBar />} />
      <Route path="/sign-in" element={<h1>Login page</h1>} />
    </Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Test Customer/ }));
    fireEvent.click(screen.getByRole('button', { name: /Sign Out/ }));
    expect(await screen.findByRole('heading', { name: 'Login page' })).toBeInTheDocument();
  });
});
