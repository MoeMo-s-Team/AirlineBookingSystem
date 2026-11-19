import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FlightResultsPage } from './FlightResultsPage';
import { BookingFlowProvider } from '../context/BookingFlowContext';
import { useFlights } from '../hooks/useFlights';
import { MOCK_FLIGHTS, STANDARD_FARE_CLASSES } from '../data/mockData';
import type { BookingFlightSelection, BookingFareOption } from '../types/bookingFlow';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => ({ ...await vi.importActual('react-router-dom'), useNavigate: () => navigate }));
vi.mock('../hooks/useFlights', () => ({ useFlights: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: true }) }));
vi.mock('../components/layout/TopNavBar', () => ({ TopNavBar: () => null }));
vi.mock('../components/layout/Footer', () => ({ Footer: () => null }));
vi.mock('../components/flight/FlightDetailsModal', () => ({ FlightDetailsModal: () => null }));
vi.mock('../components/flight/FlightCard', () => ({
  FlightCard: ({ flight, onSelectFare }: { flight: BookingFlightSelection; onSelectFare: (f: BookingFlightSelection, fare: BookingFareOption) => void }) =>
    <button onClick={() => onSelectFare(flight, flight.fareClasses[0])}>Select {flight.flightNumber}</button>,
}));

describe('round-trip flight selection', () => {
  beforeEach(() => navigate.mockClear());

  it('shows the available seat limit when the first search has too many passengers and no nearby dates', () => {
    vi.mocked(useFlights).mockReturnValue({
      filteredFlights: [], seatShortage: 1, nearbyDates: [],
      filters: { maxPrice: Number.MAX_SAFE_INTEGER, stops: 'all', departureTimeRange: 'all', airlines: [], sortBy: 'recommended' },
      updateFilter: vi.fn(), maxAvailablePrice: 2000000, isLoading: false, error: null, allFlights: [], activeFares: [],
    });
    render(<MemoryRouter initialEntries={['/flights?origin=SGN&destination=HAN&date=2099-01-10&tripType=one-way&passengers=3']}>
      <BookingFlowProvider><FlightResultsPage /></BookingFlowProvider>
    </MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent(/You selected 3 passengers.*single flight is 1/);
    expect(screen.queryByText('No flights found for this route and date.')).not.toBeInTheDocument();
  });

  it('changes a suggested outbound date without changing the return date', () => {
    vi.mocked(useFlights).mockReturnValue({
      filteredFlights: [], seatShortage: null, nearbyDates: [{ date: '2099-01-11', count: 2, price: 800000 }],
      filters: { maxPrice: Number.MAX_SAFE_INTEGER, stops: 'all', departureTimeRange: 'all', airlines: [], sortBy: 'recommended' },
      updateFilter: vi.fn(), maxAvailablePrice: 2000000, isLoading: false, error: null, allFlights: [], activeFares: [],
    });
    render(<MemoryRouter initialEntries={['/flights?origin=SGN&destination=HAN&date=2099-01-10&returnDate=2099-01-12&tripType=round-trip&passengers=2']}>
      <BookingFlowProvider><FlightResultsPage /></BookingFlowProvider>
    </MemoryRouter>);
    expect(useFlights).toHaveBeenLastCalledWith(expect.objectContaining({ passengers: 2 }), undefined, '2099-01-12');
    expect(screen.getByText(/No flights with enough seats on/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /2 flights.*From/ }));
    const params = new URL(navigate.mock.calls[0][0], 'http://localhost').searchParams;
    expect(params.get('date')).toBe('2099-01-11');
    expect(params.get('returnDate')).toBe('2099-01-12');
    expect(params.get('passengers')).toBe('2');
  });

  it('changes only the return date when choosing a return suggestion', () => {
    const fare = { ...STANDARD_FARE_CLASSES[0], id: 1, code: 'ECONOMY', price: 1000000, priceMultiplier: 1 };
    const outbound = { ...MOCK_FLIGHTS[0], id: 101, flightNumber: 'OUT101',
      departureAt: '2099-01-10T08:00:00', arrivalAt: '2099-01-10T10:00:00', fareClasses: [fare] };
    vi.mocked(useFlights).mockImplementation(params => ({
      filteredFlights: params.origin === 'SGN' ? [outbound] : [],
      seatShortage: null,
      nearbyDates: params.origin === 'SGN' ? [] : [{ date: '2099-01-13', count: 1, price: 800000 }],
      filters: { maxPrice: Number.MAX_SAFE_INTEGER, stops: 'all', departureTimeRange: 'all', airlines: [], sortBy: 'recommended' },
      updateFilter: vi.fn(), maxAvailablePrice: 2000000, isLoading: false, error: null, allFlights: [], activeFares: [],
    }));
    render(<MemoryRouter initialEntries={['/flights?origin=SGN&destination=HAN&date=2099-01-10&returnDate=2099-01-12&tripType=round-trip']}>
      <BookingFlowProvider><FlightResultsPage /></BookingFlowProvider>
    </MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Select OUT101' }));
    fireEvent.click(screen.getByRole('button', { name: /1 flights.*From/ }));
    const params = new URL(navigate.mock.calls[0][0], 'http://localhost').searchParams;
    expect(params.get('date')).toBe('2099-01-10');
    expect(params.get('returnDate')).toBe('2099-01-13');
    expect(params.get('origin')).toBe('SGN');
    expect(params.get('destination')).toBe('HAN');
    expect(screen.getByRole('button', { name: /Continue to Passenger Details/ })).toBeDisabled();
  });
  it('requires both legs and clears the previous return choice after replacing the outbound flight', () => {
    const fare = { ...STANDARD_FARE_CLASSES[0], id: 1, code: 'ECONOMY', price: 1000000, priceMultiplier: 1 };
    const outbound = { ...MOCK_FLIGHTS[0], id: 101, flightNumber: 'OUT101',
      departureAt: '2099-01-10T08:00:00', arrivalAt: '2099-01-10T10:00:00', fareClasses: [fare] };
    const inbound = { ...outbound, id: 202, flightNumber: 'RET202', departureCode: 'HAN', arrivalCode: 'SGN',
      departureAt: '2099-01-12T08:00:00', arrivalAt: '2099-01-12T10:00:00' };
    vi.mocked(useFlights).mockImplementation(params => ({
      filteredFlights: [params.origin === 'SGN' ? outbound : inbound], nearbyDates: [], seatShortage: null,
      filters: { maxPrice: Number.MAX_SAFE_INTEGER, stops: 'all', departureTimeRange: 'all', airlines: [], sortBy: 'recommended' },
      updateFilter: vi.fn(), maxAvailablePrice: 2000000, isLoading: false, error: null, allFlights: [], activeFares: [],
    }));
    render(<MemoryRouter initialEntries={['/flights?origin=SGN&destination=HAN&date=2099-01-10&returnDate=2099-01-12&tripType=round-trip']}>
      <BookingFlowProvider><FlightResultsPage /></BookingFlowProvider>
    </MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Select OUT101' }));
    expect(screen.getByText('Choose your return flight')).toBeInTheDocument();
    const proceed = screen.getByRole('button', { name: /Continue to Passenger Details/i });
    expect(proceed).toBeDisabled();
    expect(useFlights).toHaveBeenLastCalledWith(expect.objectContaining({ origin: 'HAN', destination: 'SGN', departureDate: '2099-01-12' }), outbound.arrivalAt, undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Select RET202' }));
    expect(proceed).not.toBeDisabled();
    fireEvent.click(proceed);
    expect(navigate).toHaveBeenCalledWith('/passenger');
    fireEvent.click(screen.getByRole('button', { name: 'Change outbound flight' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select OUT101' }));
    expect(proceed).toBeDisabled();
  });
});
