import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CheckoutPaymentPage } from './CheckoutPaymentPage';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { bookingApi } from '../api/bookingApi';
import { paymentApi } from '../api/paymentApi';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useBookingFlow', () => ({
  useBookingFlow: vi.fn(),
}));

vi.mock('../api/bookingApi', () => ({
  bookingApi: {
    createBooking: vi.fn(),
    getBooking: vi.fn(),
  },
}));

vi.mock('../api/paymentApi', () => ({
  paymentApi: {
    processPayment: vi.fn(),
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

describe('CheckoutPaymentPage', () => {
  const mockDraft = {
    selectedFlight: { id: 101, flightNumber: 'SW101', basePrice: 1000000 } as any,
    selectedFareClass: { id: 2, name: 'Eco Flex', priceMultiplier: 1.2, price: 1200000 } as any,
    passengers: [
      {
        fullName: 'Nguyen Van A',
        dateOfBirth: '1990-01-01',
        passportNo: 'C1234567',
        phone: '0901234567',
      },
    ] as any,
    selectedServices: [
      { id: 10, name: 'Baggage 20kg', price: 250000 } as any,
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(useBookingFlow).mockReturnValue({
      ...mockDraft,
    } as any);
  });

  it('unknown create outcome blocks resubmission and opens My Bookings', async () => {
    // A network failure or 500 error during create
    vi.mocked(bookingApi.createBooking).mockRejectedValue(new Error('Network timeout'));

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPaymentPage />} />
        </Routes>
      </MemoryRouter>
    );

    const createBtn = screen.getByRole('button', { name: /Confirm & Create Booking/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(sessionStorage.getItem('booking-create-outcome-unknown')).toBe('true');
      expect(mockNavigate).toHaveBeenCalledWith('/my-bookings?createOutcome=unknown', { replace: true });
    });
  });

  it('known create rejection leaves the corrected draft submit-able', async () => {
    // 400 Bad Request error from backend
    vi.mocked(bookingApi.createBooking).mockRejectedValue({
      status: 400,
      message: 'Invalid passenger passport number',
    });

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPaymentPage />} />
        </Routes>
      </MemoryRouter>
    );

    const createBtn = screen.getByRole('button', { name: /Confirm & Create Booking/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid passenger passport number/i)).toBeInTheDocument();
      expect(sessionStorage.getItem('booking-create-outcome-unknown')).toBeNull();
      expect(createBtn).not.toBeDisabled();
    });
  });

  it('treats a malformed successful create response as an unknown outcome', async () => {
    vi.mocked(bookingApi.createBooking).mockResolvedValue({
      id: 505,
      bookingCode: 'SW-505',
      status: 'CONFIRMED',
      totalPrice: 1450000,
    } as any);

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPaymentPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirm & Create Booking/i }));

    await waitFor(() => {
      expect(sessionStorage.getItem('booking-create-outcome-unknown')).toBe('true');
      expect(mockNavigate).toHaveBeenCalledWith('/my-bookings?createOutcome=unknown', { replace: true });
    });
  });

  it('creates booking with numeric IDs, enters persisted mode, and avoids second create', async () => {
    const createdBooking = {
      id: 505,
      bookingCode: 'SW-505',
      status: 'PENDING' as const,
      totalPrice: 1450000,
    };

    vi.mocked(bookingApi.createBooking).mockResolvedValue(createdBooking as any);

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPaymentPage />} />
        </Routes>
      </MemoryRouter>
    );

    const createBtn = screen.getByRole('button', { name: /Confirm & Create Booking/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(bookingApi.createBooking).toHaveBeenCalledWith({
        flightId: 101,
        fareClassId: 2,
        passengers: [
          {
            fullName: 'Nguyen Van A',
            dateOfBirth: '1990-01-01',
            passportNo: 'C1234567',
            phone: '0901234567',
          },
        ],
        services: [
          {
            serviceId: 10,
            quantity: 1,
          },
        ],
      });
      // In persisted mode, shows backend total and pay button
      expect(screen.getByText(/Pay with Mock Gateway/i)).toBeInTheDocument();
    });

    // Clicking pay invokes processPayment with bookingId: 505, paymentMethod: 'MOCK'
    let finishPayment!: (result: {
      id: number;
      bookingId: number;
      amount: number;
      paymentMethod: string;
      status: 'SUCCESS';
    }) => void;
    vi.mocked(paymentApi.processPayment).mockReturnValueOnce(new Promise((resolve) => {
      finishPayment = resolve;
    }));

    const paymentResult = {
      id: 999,
      bookingId: 505,
      amount: 1450000,
      paymentMethod: 'MOCK',
      status: 'SUCCESS',
    } as const;

    const payBtn = screen.getByRole('button', { name: /Pay with Mock Gateway/i });
    fireEvent.click(payBtn);

    const processingButton = await screen.findByRole('button', { name: /Đang xử lý thanh toán/i });
    expect(processingButton).toBeDisabled();
    finishPayment(paymentResult);

    await waitFor(() => {
      expect(paymentApi.processPayment).toHaveBeenCalledWith({
        bookingId: 505,
        paymentMethod: 'MOCK',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/confirmation/505');
    });

    // Booking create was called only once
    expect(bookingApi.createBooking).toHaveBeenCalledTimes(1);
  });

  it('payment 409 refetches and follows the authoritative status', async () => {
    // Arriving at persisted checkout with bookingId=777
    vi.mocked(bookingApi.getBooking).mockResolvedValueOnce({
      id: 777,
      bookingCode: 'SW-777',
      status: 'PENDING',
      totalPrice: 1200000,
    } as any);

    render(
      <MemoryRouter initialEntries={['/checkout?bookingId=777']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPaymentPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(bookingApi.getBooking).toHaveBeenCalledWith(777);
      expect(screen.getByRole('button', { name: /Pay with Mock Gateway/i })).toBeInTheDocument();
    });

    // Payment encounters 409 Conflict
    vi.mocked(paymentApi.processPayment).mockRejectedValueOnce({
      status: 409,
      message: 'Booking state conflict',
    });

    // Booking refetch returns CONFIRMED
    vi.mocked(bookingApi.getBooking).mockResolvedValueOnce({
      id: 777,
      bookingCode: 'SW-777',
      status: 'CONFIRMED',
      totalPrice: 1200000,
    } as any);

    const payBtn = screen.getByRole('button', { name: /Pay with Mock Gateway/i });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(bookingApi.getBooking).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenCalledWith('/confirmation/777');
    });
  });

  it('does not offer payment for a cancelled booking', async () => {
    vi.mocked(bookingApi.getBooking).mockResolvedValue({
      id: 888,
      bookingCode: 'SW-888',
      status: 'CANCELLED',
      totalPrice: 1200000,
    } as any);

    render(
      <MemoryRouter initialEntries={['/checkout?bookingId=888']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPaymentPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/đã bị hủy và không thể thanh toán/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Pay with Mock Gateway/i })).not.toBeInTheDocument();
    });
    expect(paymentApi.processPayment).not.toHaveBeenCalled();
  });

  it('keeps payment paused after an uncertain payment result until status can be reloaded', async () => {
    vi.mocked(bookingApi.getBooking)
      .mockResolvedValueOnce({
        id: 777,
        bookingCode: 'SW-777',
        status: 'PENDING',
        totalPrice: 1200000,
      } as any)
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce({
        id: 777,
        bookingCode: 'SW-777',
        status: 'PENDING',
        totalPrice: 1200000,
      } as any);
    vi.mocked(paymentApi.processPayment).mockRejectedValueOnce(new Error('Network timeout'));

    render(
      <MemoryRouter initialEntries={['/checkout?bookingId=777']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPaymentPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /Pay with Mock Gateway/i }));

    const retryButton = await screen.findByRole('button', { name: /Kiểm tra trạng thái lại/i });
    expect(screen.queryByRole('button', { name: /Pay with Mock Gateway/i })).not.toBeInTheDocument();
    expect(paymentApi.processPayment).toHaveBeenCalledTimes(1);

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(bookingApi.getBooking).toHaveBeenCalledTimes(3);
      expect(screen.getByRole('button', { name: /Pay with Mock Gateway/i })).toBeInTheDocument();
    });
  });

  it('shows a terminal failure when the gateway reports failed payment', async () => {
    vi.mocked(bookingApi.getBooking).mockResolvedValueOnce({
      id: 999,
      bookingCode: 'SW-999',
      status: 'PENDING',
      totalPrice: 1200000,
    } as any);
    vi.mocked(paymentApi.processPayment).mockResolvedValue({
      id: 1000,
      bookingId: 999,
      amount: 1200000,
      paymentMethod: 'MOCK',
      status: 'FAILED',
    });

    render(
      <MemoryRouter initialEntries={['/checkout?bookingId=999']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPaymentPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /Pay with Mock Gateway/i }));

    await waitFor(() => {
      expect(screen.getByText(/Thanh toán thất bại \(PAYMENT_FAILED\)/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Pay with Mock Gateway/i })).not.toBeInTheDocument();
    });
  });
});
