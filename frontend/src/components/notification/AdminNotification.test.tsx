import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotificationItem } from './NotificationItem';

it('opens the admin dossier for a new customer booking notification', () => {
  render(<MemoryRouter><NotificationItem notification={{
    id: 1, type: 'ADMIN_BOOKING_CREATED', message: 'New booking BKTEST is awaiting payment.',
    bookingId: 42, isRead: false, createdAt: '2026-12-01T10:00:00',
  }} onMarkRead={vi.fn()} /></MemoryRouter>);
  expect(screen.getByRole('link', { name: /New customer booking/i })).toHaveAttribute('href', '/admin/bookings?bookingId=42');
});
