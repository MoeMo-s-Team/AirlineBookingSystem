import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SearchFlightPage } from './SearchFlightPage';
import { BookingFlowProvider } from '../context/BookingFlowContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/NotificationContext', () => ({
  useNotifications: () => ({ unreadCount: 0 }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    signOut: vi.fn(),
  }),
}));

describe('SearchFlightPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('a deliberate new search clears the same-tab guard', () => {
    sessionStorage.setItem('booking-create-outcome-unknown', 'true');
    expect(sessionStorage.getItem('booking-create-outcome-unknown')).toBe('true');

    render(
      <MemoryRouter>
        <BookingFlowProvider>
          <SearchFlightPage />
        </BookingFlowProvider>
      </MemoryRouter>
    );

    const searchBtn = screen.getByRole('button', { name: /Search SkyWing Flights/i });
    fireEvent.click(searchBtn);

    expect(sessionStorage.getItem('booking-create-outcome-unknown')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/flights?'));
  });

  it('rejects an origin equal to destination without navigating', () => {
    render(
      <MemoryRouter><BookingFlowProvider><SearchFlightPage /></BookingFlowProvider></MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Destination airport'), { target: { value: 'SGN' } });
    fireEvent.click(screen.getByRole('button', { name: /Search SkyWing Flights/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Sân bay đi và sân bay đến phải khác nhau.');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('rejects a past departure date without navigating', () => {
    render(
      <MemoryRouter><BookingFlowProvider><SearchFlightPage /></BookingFlowProvider></MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Departure Date'), { target: { value: '2020-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Search SkyWing Flights/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Ngày bay không được ở trong quá khứ.');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
