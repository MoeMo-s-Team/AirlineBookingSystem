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
});
