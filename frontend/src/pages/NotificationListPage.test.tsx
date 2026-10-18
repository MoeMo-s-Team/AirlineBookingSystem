import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotificationListPage } from './NotificationListPage';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../context/NotificationContext', () => ({ useNotifications: vi.fn() }));
vi.mock('../components/layout/TopNavBar', () => ({ TopNavBar: () => null }));
vi.mock('../components/layout/Footer', () => ({ Footer: () => null }));

describe('NotificationListPage', () => {
  const listPage = vi.fn();
  const markAllRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, user: { id: 'customer-1' } } as ReturnType<typeof useAuth>);
    vi.mocked(useNotifications).mockReturnValue({
      listPage,
      markAllRead,
      markRead: vi.fn(),
      refresh: vi.fn(),
      unreadCount: 1,
    } as unknown as ReturnType<typeof useNotifications>);
    listPage.mockResolvedValue({
      data: [{ id: 7, type: 'BOOKING_CREATED', message: 'Booking awaits payment.', isRead: false, bookingId: 42, createdAt: '2026-10-15T09:00:00' }],
      pagination: { total: 1, limit: 20, offset: 0 },
    });
    markAllRead.mockResolvedValue(1);
  });

  it('opens the owner-scoped booking route and marks all notifications as read', async () => {
    render(<MemoryRouter><NotificationListPage /></MemoryRouter>);

    expect(await screen.findByText('Booking awaits payment.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View booking #42' })).toHaveAttribute('href', '/my-bookings/42');

    fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));
    await waitFor(() => expect(markAllRead).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(listPage).toHaveBeenCalledTimes(2));
  });

  it('hides the previous account’s notifications while the next account loads', async () => {
    const { rerender } = render(<MemoryRouter><NotificationListPage /></MemoryRouter>);
    expect(await screen.findByText('Booking awaits payment.')).toBeInTheDocument();

    listPage.mockReturnValueOnce(new Promise(() => {}));
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, user: { id: 'customer-2' } } as ReturnType<typeof useAuth>);
    rerender(<MemoryRouter><NotificationListPage /></MemoryRouter>);

    expect(screen.queryByText('Booking awaits payment.')).not.toBeInTheDocument();
  });
});
