import { describe, it, expect, vi, beforeEach } from 'vitest';
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
