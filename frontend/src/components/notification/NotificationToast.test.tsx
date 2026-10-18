import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchNotifications, fetchUnreadCount } from '../../api/notificationApi';
import { NotificationProvider, useNotifications } from '../../context/NotificationContext';
import { NotificationToast } from './NotificationToast';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../api/notificationApi', () => ({
  fetchNotifications: vi.fn(),
  fetchUnreadCount: vi.fn(),
  markNotificationRead: vi.fn(),
}));

function RefreshButton() {
  const { refresh, status } = useNotifications();
  return <button type="button" data-status={status} onClick={() => { void refresh(); }}>Refresh</button>;
}

describe('NotificationToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'customer-1' },
      getAccessToken: vi.fn().mockResolvedValue('test-token'),
    } as unknown as ReturnType<typeof useAuth>);
    vi.mocked(fetchUnreadCount).mockResolvedValue(0);
  });

  it('shows a toast only when a new unread booking update arrives after initial load', async () => {
    vi.mocked(fetchNotifications)
      .mockResolvedValueOnce({ data: [], pagination: { total: 0, limit: 5, offset: 0 } })
      .mockResolvedValueOnce({
        data: [{ id: 11, type: 'BOOKING_CREATED', message: 'Booking BK11 awaits payment.', isRead: false, bookingId: 42, createdAt: '2026-10-16T10:00:00' }],
        pagination: { total: 1, limit: 5, offset: 0 },
      });

    render(<MemoryRouter><NotificationProvider><RefreshButton /><NotificationToast /></NotificationProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh' })).toHaveAttribute('data-status', 'ready'));
    expect(screen.queryByText('Booking BK11 awaits payment.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(await screen.findByText('Booking BK11 awaits payment.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View booking' })).toHaveAttribute('href', '/my-bookings/42');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Booking BK11 awaits payment.')).not.toBeInTheDocument();
  });
});
