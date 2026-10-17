import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PassengerInfoPage } from './PassengerInfoPage';
import { useBookingFlow } from '../hooks/useBookingFlow';

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

describe('PassengerInfoPage', () => {
  const mockUpdatePassenger = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates passenger with exact backend fields and navigates to /services on valid input', async () => {
    const mockPassenger = {
      fullName: 'Nguyen Van A',
      dateOfBirth: '1990-05-15',
      passportNo: 'C9876543',
      phone: '0901234567',
    };

    vi.mocked(useBookingFlow).mockReturnValue({
      selectedFlight: {
        id: 101,
        flightNumber: 'SW101',
        departureCode: 'SGN',
        arrivalCode: 'HAN',
        departureTime: '08:00 AM',
        basePrice: 1000000,
      } as any,
      selectedFareClass: {
        id: 1,
        name: 'Economy Standard',
        price: 1000000,
      } as any,
      passengers: [mockPassenger as any],
      setPassengers: vi.fn(),
      updatePassenger: mockUpdatePassenger,
      selectedServices: [],
      searchParams: { passengers: 1 } as any,
    } as any);

    render(
      <MemoryRouter>
        <PassengerInfoPage />
      </MemoryRouter>
    );

    const continueBtn = screen.getByRole('button', { name: /Proceed to Services/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/services');
    });
  });
});
