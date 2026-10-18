import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MyBookingsPage } from './MyBookingsPage';
import { bookingApi } from '../api/bookingApi';

vi.mock('../api/bookingApi', () => ({
  bookingApi: {
    getMyBookings: vi.fn(),
    getBooking: vi.fn(),
    cancelBooking: vi.fn(),
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

describe('MyBookingsPage', () => {
  const mockSummaries = [
    {
      id: 101,
      bookingCode: 'SW-PENDING-101',
      status: 'PENDING' as const,
      totalPrice: 1500000,
      createdAt: '2026-10-15T08:00:00',
      flight: {
        flightNumber: 'SW101',
        originAirport: 'SGN',
        destinationAirport: 'HAN',
        departureTime: '2026-10-16T08:00:00',
        arrivalTime: '2026-10-16T10:00:00',
      },
      fareClass: {
        name: 'Economy Flex',
        code: 'ECO_FLEX',
      },
    },
    {
      id: 102,
      bookingCode: 'SW-CONFIRMED-102',
      status: 'CONFIRMED' as const,
      totalPrice: 2000000,
      createdAt: '2026-10-14T08:00:00',
      flight: {
        flightNumber: 'SW202',
        originAirport: 'HAN',
        destinationAirport: 'DAD',
        departureTime: '2026-10-17T09:00:00',
        arrivalTime: '2026-10-17T10:30:00',
      },
      fareClass: {
        name: 'Business Standard',
        code: 'BIZ_STD',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads booking summaries from /bookings/me and displays cards', async () => {
    vi.mocked(bookingApi.getMyBookings).mockResolvedValue(mockSummaries);

    render(
      <MemoryRouter initialEntries={['/my-bookings']}>
        <Routes>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(bookingApi.getMyBookings).toHaveBeenCalled();
      expect(screen.getByText('SW-PENDING-101')).toBeInTheDocument();
      expect(screen.getByText('SW-CONFIRMED-102')).toBeInTheDocument();
      expect(screen.getByText(/SW101/)).toBeInTheDocument();
    });
  });

  it('opening a card fetches its ID detail', async () => {
    vi.mocked(bookingApi.getMyBookings).mockResolvedValue(mockSummaries);
    vi.mocked(bookingApi.getBooking).mockResolvedValue({
      id: 101,
      bookingCode: 'SW-PENDING-101',
      status: 'PENDING',
      flight: {
        flightNumber: 'SW101',
        originAirport: 'SGN',
        destinationAirport: 'HAN',
      },
      passengers: [{ id: 1, fullName: 'Nguyen Van A', passportNo: 'B1234567' }],
      services: [{ id: 1, serviceName: 'Extra Baggage 20kg', quantity: 1, unitPrice: 200000 }],
      totalPrice: 1500000,
    } as any);

    render(
      <MemoryRouter initialEntries={['/my-bookings']}>
        <Routes>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SW-PENDING-101')).toBeInTheDocument();
    });

    const viewDetailBtns = screen.getAllByRole('button', { name: /dossier|chi tiết|view/i });
    fireEvent.click(viewDetailBtns[0]);

    await waitFor(() => {
      expect(bookingApi.getBooking).toHaveBeenCalledWith(101);
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
      expect(screen.getByText(/Extra Baggage 20kg/)).toBeInTheDocument();
    });
  });

  it('only PENDING offers cancellation, and successful cancel updates status from minimal response', async () => {
    vi.mocked(bookingApi.getMyBookings).mockResolvedValue(mockSummaries);
    vi.mocked(bookingApi.cancelBooking).mockResolvedValue({
      id: 101,
      bookingCode: 'SW-PENDING-101',
      status: 'CANCELLED',
    });

    render(
      <MemoryRouter initialEntries={['/my-bookings']}>
        <Routes>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SW-PENDING-101')).toBeInTheDocument();
    });

    // PENDING card has cancel button, CONFIRMED does not
    const cancelButtons = screen.getAllByRole('button', { name: /^hủy đặt chỗ$/i });
    expect(cancelButtons).toHaveLength(1);

    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(bookingApi.cancelBooking).toHaveBeenCalledWith(101);
      // Status updated to CANCELLED without full refetch
      expect(screen.getAllByText(/CANCELLED/i).length).toBeGreaterThan(0);
    });
  });

  it('cancel 409 refetches and renders current booking', async () => {
    vi.mocked(bookingApi.getMyBookings).mockResolvedValue([mockSummaries[0]]);
    const error409 = new Error('Booking cannot be cancelled in its current state');
    (error409 as any).status = 409;
    vi.mocked(bookingApi.cancelBooking).mockRejectedValue(error409);

    vi.mocked(bookingApi.getBooking).mockResolvedValue({
      id: 101,
      bookingCode: 'SW-PENDING-101',
      status: 'CONFIRMED',
      flight: {
        flightNumber: 'SW101',
        originAirport: 'SGN',
        destinationAirport: 'HAN',
      },
      totalPrice: 1500000,
    } as any);

    render(
      <MemoryRouter initialEntries={['/my-bookings']}>
        <Routes>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SW-PENDING-101')).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: /^hủy đặt chỗ$/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(bookingApi.cancelBooking).toHaveBeenCalledWith(101);
      expect(bookingApi.getBooking).toHaveBeenCalledWith(101);
      expect(screen.getAllByText(/CONFIRMED/i).length).toBeGreaterThan(1);
    });
  });

  it('displays manual-verification guidance when createOutcome=unknown', async () => {
    vi.mocked(bookingApi.getMyBookings).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/my-bookings?createOutcome=unknown']}>
        <Routes>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Manual Verification Required/i)).toBeInTheDocument();
    });
  });
});
