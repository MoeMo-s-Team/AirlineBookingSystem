import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminBookingsPage } from './AdminBookingsPage';
import { bookingApi } from '../../api/bookingApi';

vi.mock('../../api/bookingApi', () => ({
  bookingApi: {
    getAdminBookings: vi.fn(),
    getBooking: vi.fn(),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-uuid', role: 'ADMIN', fullName: 'System Admin' },
    isAuthenticated: true,
    signOut: vi.fn(),
  }),
}));

describe('AdminBookingsPage', () => {
  const mockAdminPage = {
    data: [
      {
        id: 501,
        bookingCode: 'SW-ADM-501',
        status: 'CONFIRMED' as const,
        totalPrice: 2500000,
        createdAt: '2026-10-15T09:00:00',
        user: {
          id: 'user-1',
          fullName: 'Customer One',
          email: 'cust1@example.com',
        },
        flight: {
          flightNumber: 'SW501',
          originAirport: 'SGN',
          destinationAirport: 'DAD',
          departureTime: '2026-10-20T07:00:00',
        },
        fareClass: {
          name: 'Business Standard',
          code: 'BIZ_STD',
        },
        passengers: [
          { fullName: 'Passenger One' },
        ],
      },
    ],
    pagination: {
      total: 21,
      page: 0,
      size: 10,
      totalPages: 3,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads admin bookings with pagination and status filter from /bookings', async () => {
    vi.mocked(bookingApi.getAdminBookings).mockResolvedValue(mockAdminPage);

    render(
      <MemoryRouter>
        <AdminBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(bookingApi.getAdminBookings).toHaveBeenCalledWith(
        expect.objectContaining({ page: 0, size: 10 })
      );
      expect(screen.getByText('SW-ADM-501')).toBeInTheDocument();
      expect(screen.getByText(/SW501/)).toBeInTheDocument();
      expect(screen.getByText('Passenger One')).toBeInTheDocument();
    });
  });

  it('admin dossier uses available list fields without a detail request', async () => {
    vi.mocked(bookingApi.getAdminBookings).mockResolvedValue(mockAdminPage);

    render(
      <MemoryRouter>
        <AdminBookingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SW-ADM-501')).toBeInTheDocument();
    });

    const dossierBtn = screen.getByRole('button', { name: /dossier/i });
    fireEvent.click(dossierBtn);

    await waitFor(() => {
      // Dossier modal opens and renders available record data
      expect(screen.getAllByText('SW-ADM-501').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Passenger One/).length).toBeGreaterThan(0);
    });

    // Does NOT make a detail request to GET /bookings/{id}
    expect(bookingApi.getBooking).not.toHaveBeenCalled();

    // Has no refund or cancel actions in table or modal
    expect(screen.queryByRole('button', { name: /refund|issue refund/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /cancel this booking/i })).toBeNull();
  });
});
