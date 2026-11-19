import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFlights } from './useFlights';
import { searchFlights } from '../api/flightApi';
import { fareApi } from '../api/fareApi';

vi.mock('../api/flightApi', () => ({
  searchFlights: vi.fn(),
}));

vi.mock('../api/fareApi', () => ({
  fareApi: {
    getActiveFares: vi.fn(),
  },
}));

describe('useFlights', () => {
  const mockSearchParams = {
    tripType: 'one-way' as const,
    origin: 'SGN',
    destination: 'HAN',
    departureDate: '2026-10-15',
    passengers: 1,
    cabinClass: 'Economy' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-01T00:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('offers nearby dates separately from exact-day flights', async () => {
    vi.mocked(searchFlights).mockResolvedValue([{
      id: 303, flightNumber: 'SW303', origin: 'SGN', destination: 'HAN',
      departureTime: '2026-10-16T08:00:00', arrivalTime: '2026-10-16T10:00:00',
      basePrice: 1200000, availableSeats: 10, prices: {},
    }]);
    vi.mocked(fareApi.getActiveFares).mockResolvedValue([{ id: 1, code: 'ECONOMY', name: 'Economy', priceMultiplier: 1, active: true }]);
    const { result } = renderHook(() => useFlights(mockSearchParams));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filteredFlights).toEqual([]);
    expect(result.current.nearbyDates).toEqual([{ date: '2026-10-16', count: 1, price: 1200000 }]);
  });

  it('suggests only enough-seat future flights within three days at the lowest active fare per passenger', async () => {
    const flight = { id: 1, flightNumber: 'SW1', origin: 'SGN', destination: 'HAN',
      departureTime: '2026-10-15T08:00:00', arrivalTime: '2026-10-15T10:00:00',
      basePrice: 1000000, availableSeats: 1, prices: {} };
    vi.mocked(searchFlights).mockResolvedValueOnce([
      { ...flight, id: 2, departureTime: '2026-10-16T08:00:00', availableSeats: 3 },
      { ...flight, id: 3, departureTime: '2026-10-16T09:00:00', basePrice: 800000, availableSeats: 3 },
      { ...flight, id: 4, departureTime: '2026-10-14T08:00:00', availableSeats: 3 },
      { ...flight, id: 5, departureTime: '2026-10-19T08:00:00', availableSeats: 3 },
      { ...flight, id: 6, departureTime: '2026-10-16T08:00:00', availableSeats: 3, status: 'CANCELLED' },
      { ...flight, id: 7, departureTime: '2026-09-30T08:00:00', availableSeats: 3 },
    ]).mockResolvedValueOnce([flight]);
    vi.mocked(fareApi.getActiveFares).mockResolvedValue([
      { id: 1, code: 'PREMIUM', name: 'Premium', priceMultiplier: 1.5, active: true },
      { id: 2, code: 'PROMO', name: 'Promo', priceMultiplier: 0.8, active: true },
      { id: 3, code: 'OLD', name: 'Old', priceMultiplier: 0.1, active: false },
    ]);
    const { result } = renderHook(() => useFlights({ ...mockSearchParams, passengers: 2 }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.allFlights).toEqual([]);
    expect(result.current.seatShortage).toBe(1);
    expect(result.current.nearbyDates).toEqual([
      { date: '2026-10-14', count: 1, price: 800000 },
      { date: '2026-10-16', count: 2, price: 640000 },
    ]);
    expect(searchFlights).toHaveBeenCalledWith(expect.objectContaining({ passengers: 2 }), expect.any(AbortSignal));
  });

  it('does not suggest another day when the selected date has a bookable flight', async () => {
    const flight = { id: 1, flightNumber: 'SW1', origin: 'SGN', destination: 'HAN',
      departureTime: '2026-10-15T08:00:00', arrivalTime: '2026-10-15T10:00:00',
      basePrice: 1000000, availableSeats: 3, prices: {} };
    vi.mocked(searchFlights).mockResolvedValue([flight, { ...flight, id: 2, departureTime: '2026-10-16T08:00:00' }]);
    vi.mocked(fareApi.getActiveFares).mockResolvedValue([]);
    const { result } = renderHook(() => useFlights(mockSearchParams));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.allFlights.map(f => f.id)).toEqual([1]);
    expect(result.current.nearbyDates).toEqual([]);
  });

  it('constrains each round-trip leg without querying the combined round-trip endpoint', async () => {
    vi.mocked(searchFlights).mockResolvedValue([
      { id: 1, flightNumber: 'RET1', origin: 'HAN', destination: 'SGN', departureTime: '2026-10-15T08:00:00', arrivalTime: '2026-10-15T10:00:00', basePrice: 1000000, availableSeats: 5, prices: {} },
      { id: 2, flightNumber: 'RET2', origin: 'HAN', destination: 'SGN', departureTime: '2026-10-16T08:00:00', arrivalTime: '2026-10-16T10:00:00', basePrice: 1000000, availableSeats: 5, prices: {} },
      { id: 3, flightNumber: 'RET3', origin: 'HAN', destination: 'SGN', departureTime: '2026-10-17T08:00:00', arrivalTime: '2026-10-17T10:00:00', basePrice: 1000000, availableSeats: 5, prices: {} },
    ]);
    vi.mocked(fareApi.getActiveFares).mockResolvedValue([{ id: 1, code: 'ECONOMY', name: 'Economy', priceMultiplier: 1, active: true }]);
    const { result } = renderHook(() => useFlights({ ...mockSearchParams, tripType: 'round-trip', returnDate: '2026-10-16' },
      '2026-10-15T10:00:00', '2026-10-16'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.nearbyDates).toEqual([{ date: '2026-10-16', count: 1, price: 1000000 }]);
    expect(searchFlights).toHaveBeenCalledWith({ origin: 'SGN', destination: 'HAN', date: '2026-10-15',
      passengers: 1, notBefore: '2026-10-15T10:00:00', notAfterDate: '2026-10-16' }, expect.any(AbortSignal));
  });

  it('preserves numeric flight id, raw basePrice, and filters inactive fares', async () => {
    vi.mocked(searchFlights).mockResolvedValue([
      {
        id: 101,
        flightNumber: 'SW101',
        origin: 'SGN',
        destination: 'HAN',
        departureTime: '2026-10-15T08:00:00',
        arrivalTime: '2026-10-15T10:00:00',
        basePrice: 1500000,
        availableSeats: 45,
        prices: {},
      },
    ]);

    vi.mocked(fareApi.getActiveFares).mockResolvedValue([
      {
        id: 1,
        code: 'ECO',
        name: 'Economy Standard',
        priceMultiplier: 1.0,
        active: true,
      },
      {
        id: 2,
        code: 'BUS',
        name: 'Business Class',
        priceMultiplier: 2.5,
        active: true,
      },
      {
        id: 3,
        code: 'OLD',
        name: 'Discontinued Tier',
        priceMultiplier: 1.2,
        active: false, // inactive fare must be excluded
      },
    ]);

    const { result } = renderHook(() => useFlights(mockSearchParams));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.filteredFlights).toHaveLength(1);
    const flight = result.current.filteredFlights[0];

    // Flight id is a number directly
    expect(flight.id).toBe(101);
    expect(typeof flight.id).toBe('number');
    // Raw basePrice preserved
    expect(flight.basePrice).toBe(1500000);

    // Fares: only active fares included
    expect(flight.fareClasses).toHaveLength(2);
    expect(flight.fareClasses.map(f => f.id)).toEqual([1, 2]);

    // Multiplier calculation: basePrice * multiplier
    const ecoFare = flight.fareClasses.find(f => f.id === 1)!;
    expect(ecoFare.price).toBe(1500000 * 1.0);
    const busFare = flight.fareClasses.find(f => f.id === 2)!;
    expect(busFare.price).toBe(1500000 * 2.5);
  });

  it('renders unknown fare codes with backend name and price without throwing', async () => {
    vi.mocked(searchFlights).mockResolvedValue([
      {
        id: 202,
        flightNumber: 'SW202',
        origin: 'SGN',
        destination: 'HAN',
        departureTime: '2026-10-15T14:00:00',
        arrivalTime: '2026-10-15T16:00:00',
        basePrice: 2000000,
        availableSeats: 10,
        prices: {},
      },
    ]);

    vi.mocked(fareApi.getActiveFares).mockResolvedValue([
      {
        id: 99,
        code: 'SPECIAL_PROMO_2026',
        name: 'Flash Sale Promo',
        priceMultiplier: 0.8,
        active: true,
      },
    ]);

    const { result } = renderHook(() => useFlights(mockSearchParams));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const flight = result.current.filteredFlights[0];
    expect(flight.fareClasses).toHaveLength(1);
    expect(flight.fareClasses[0].name).toBe('Flash Sale Promo');
    expect(flight.fareClasses[0].price).toBe(2000000 * 0.8);
    expect(flight.fareClasses[0].id).toBe(99);
  });
});
