import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NotificationBookingDetailPage } from './NotificationBookingDetailPage';
import { getNotificationBookingDetail } from '../api/notificationBookingApi';
import { useAuth } from '../context/AuthContext';

vi.mock('../api/notificationBookingApi', () => ({ getNotificationBookingDetail: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../components/layout/TopNavBar', () => ({ TopNavBar: () => null }));
vi.mock('../components/layout/Footer', () => ({ Footer: () => null }));

describe('NotificationBookingDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as ReturnType<typeof useAuth>);
  });

  it('loads the related booking by ID and renders only backend fields', async () => {
    vi.mocked(getNotificationBookingDetail).mockResolvedValue({
      id: 42,
      bookingCode: 'BK-42',
      status: 'PENDING',
      flight: { flightNumber: 'SW101', origin: 'SGN', destination: 'HAN', departureTime: '2026-10-20T08:00:00' },
      fareClass: { name: 'Economy' },
      passengers: [{ id: 1, fullName: 'Nguyen Van A' }],
      services: [],
      totalPrice: 1200000,
      payment: null,
    });

    render(<MemoryRouter initialEntries={['/my-bookings/42']}><Routes><Route path="/my-bookings/:bookingId" element={<NotificationBookingDetailPage />} /></Routes></MemoryRouter>);

    expect(await screen.findByText('BK-42')).toBeInTheDocument();
    expect(getNotificationBookingDetail).toHaveBeenCalledWith(42);
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.queryByText(/ticket issued/i)).not.toBeInTheDocument();
  });

  it('does not request a booking when the route ID is invalid', () => {
    render(<MemoryRouter initialEntries={['/my-bookings/invalid']}><Routes><Route path="/my-bookings/:bookingId" element={<NotificationBookingDetailPage />} /></Routes></MemoryRouter>);

    expect(screen.getByRole('alert')).toHaveTextContent('Mã đơn đặt vé không hợp lệ.');
    expect(getNotificationBookingDetail).not.toHaveBeenCalled();
  });
});
