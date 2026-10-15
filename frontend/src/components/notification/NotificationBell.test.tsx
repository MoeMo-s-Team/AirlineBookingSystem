import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth, type AuthContextType } from '../../context/AuthContext';
import { fetchNotifications, fetchUnreadCount, markNotificationRead } from '../../api/notificationApi';
import { NotificationProvider } from '../../context/NotificationContext';
import { NotificationBell } from './NotificationBell';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../api/notificationApi', () => ({
  fetchNotifications: vi.fn(),
  fetchUnreadCount: vi.fn(),
  markNotificationRead: vi.fn(),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'customer-id', email: 'customer@example.com', fullName: 'Customer', role: 'CUSTOMER' },
      getAccessToken: vi.fn().mockResolvedValue('test-token'),
    } as unknown as AuthContextType);
  });

  it('shows an unread badge and clears it after marking the notification read', async () => {
    let isRead = false;
    vi.mocked(fetchNotifications).mockImplementation(async () => ({
      data: [{
        id: 7,
        type: 'BOOKING_CONFIRMED',
        message: 'Your booking BK123 has been confirmed.',
        isRead,
        bookingId: 12,
        createdAt: '2026-10-15T09:00:00',
      }],
      pagination: { total: 1, limit: 5, offset: 0 },
    }));
    vi.mocked(fetchUnreadCount).mockImplementation(async () => isRead ? 0 : 1);
    vi.mocked(markNotificationRead).mockImplementation(async () => { isRead = true; });

    render(
      <MemoryRouter>
        <NotificationProvider>
          <NotificationBell />
        </NotificationProvider>
      </MemoryRouter>,
    );

    const bell = await screen.findByRole('button', { name: 'Notifications, 1 unread' });
    fireEvent.click(bell);
    expect(await screen.findByText('Your booking BK123 has been confirmed.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Mark as read' })).not.toBeInTheDocument();
    expect(markNotificationRead).toHaveBeenCalledWith('test-token', 7);
  });
});
