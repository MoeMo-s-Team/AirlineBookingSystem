import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BookingConfirmationPage } from './BookingConfirmationPage';
import { bookingApi } from '../api/bookingApi';

vi.mock('../api/bookingApi', () => ({
  bookingApi: {
    getBooking: vi.fn(),
  },
}));

vi.mock('../context/NotificationContext', () => ({
  useNotifications: () => ({ unreadCount: 0 }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com', fullName: 'Test User' },
    isAuthenticated: true,
    signOut: vi.fn(),
  }),
}));

describe('BookingConfirmationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads booking from backend by id and displays confirmed reservation', async () => {
    vi.mocked(bookingApi.getBooking).mockResolvedValue({
      id: 808,
      bookingCode: 'SW-CONFIRM-808',
      status: 'CONFIRMED',
      flight: {
        flightNumber: 'SW101',
        originAirport: 'SGN',
        destinationAirport: 'HAN',
        departureTime: '2026-10-15T08:00:00',
        arrivalTime: '2026-10-15T10:00:00',
      },
      fareClass: {
        name: 'Economy Flex',
      },
      passengers: [
        { fullName: 'Tran Thi B' },
      ],
      services: [
        { serviceName: 'Extra Baggage', quantity: 1, unitPrice: 200000 },
      ],
      totalPrice: 1700000,
      createdAt: '2026-10-15T09:00:00',
    } as any);

    render(
      <MemoryRouter initialEntries={['/confirmation/808']}>
        <Routes>
          <Route path="/confirmation/:bookingId" element={<BookingConfirmationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(bookingApi.getBooking).toHaveBeenCalledWith(808);
      expect(screen.getByText('SW-CONFIRM-808')).toBeInTheDocument();
      expect(screen.getByText(/Booking Confirmed/i)).toBeInTheDocument();
      expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    });

    // Does not make fake ticket-issued or mock seat claims
    expect(screen.queryByText(/Electronic Boarding Card/i)).toBeNull();
    expect(screen.queryByText(/03A/)).toBeNull();
  });

  it('shows recoverable error with link to My Bookings if booking is not CONFIRMED or not found', async () => {
    vi.mocked(bookingApi.getBooking).mockResolvedValue({
      id: 809,
      bookingCode: 'SW-PENDING-809',
      status: 'PENDING',
      totalPrice: 1000000,
    } as any);

    render(
      <MemoryRouter initialEntries={['/confirmation/809']}>
        <Routes>
          <Route path="/confirmation/:bookingId" element={<BookingConfirmationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Đơn đặt vé chưa hoàn tất xác nhận/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Xem trong Quản lý đặt chỗ/i })).toHaveAttribute(
        'href',
        '/my-bookings'
      );
    });
  });
});
