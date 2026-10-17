import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdditionalServicesPage } from './AdditionalServicesPage';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { serviceApi } from '../api/serviceApi';

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

vi.mock('../api/serviceApi', () => ({
  serviceApi: {
    getActiveServices: vi.fn(),
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

describe('AdditionalServicesPage', () => {
  const mockToggleService = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBookingFlow).mockReturnValue({
      selectedFlight: { id: 101, flightNumber: 'SW101', basePrice: 1000000 } as any,
      selectedFareClass: { id: 1, name: 'Eco', price: 1000000 } as any,
      passengers: [{ fullName: 'Nguyen Van A' }] as any,
      selectedServices: [],
      toggleService: mockToggleService,
    } as any);
  });

  it('loads active services from API, excludes inactive, and toggles selection', async () => {
    vi.mocked(serviceApi.getActiveServices).mockResolvedValue([
      {
        id: 10,
        name: 'Extra Luggage 20kg',
        type: 'BAGGAGE',
        price: 250000,
        active: true,
      },
      {
        id: 11,
        name: 'Expired Promotion Service',
        type: 'MEAL',
        price: 50000,
        active: false, // inactive must be excluded
      },
    ]);

    render(
      <MemoryRouter>
        <AdditionalServicesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Extra Luggage 20kg')).toBeInTheDocument();
    });

    expect(screen.queryByText('Expired Promotion Service')).toBeNull();

    const addBtn = screen.getByRole('button', { name: /Add Service/i });
    fireEvent.click(addBtn);

    expect(mockToggleService).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 10,
        name: 'Extra Luggage 20kg',
        price: 250000,
      })
    );
  });
});
