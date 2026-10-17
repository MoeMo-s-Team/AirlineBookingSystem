import { useEffect, useMemo, useState } from 'react';
import { searchFlights, FlightApiModel } from '../api/flightApi';
import { fareApi, type FareClassResponse } from '../api/fareApi';
import { AIRPORTS, STANDARD_FARE_CLASSES } from '../data/mockData';
import { FlightFilterOptions, FlightSearchParams } from '../types';
import type { BookingFlightSelection, BookingFareOption } from '../types/bookingFlow';

export function useFlights(searchParams: FlightSearchParams) {
  const [flights, setFlights] = useState<readonly BookingFlightSelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FlightFilterOptions>({
    maxPrice: Number.MAX_SAFE_INTEGER,
    stops: 'all',
    departureTimeRange: 'all',
    airlines: [],
    sortBy: 'recommended'
  });

  const updateFilter = <K extends keyof FlightFilterOptions>(key: K, value: FlightFilterOptions[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    Promise.all([
      searchFlights({
        origin: searchParams.origin,
        destination: searchParams.destination,
        date: searchParams.departureDate
      }, controller.signal),
      fareApi.getActiveFares().catch(() => [] as FareClassResponse[]),
    ])
      .then(([flightsResult, activeFares]) => {
        setFlights(flightsResult.map(f => toFlightViewModel(f, activeFares)));
      })
      .catch(cause => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return;
        setFlights([]);
        setError(cause instanceof Error ? cause.message : 'Không thể tải danh sách chuyến bay.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [searchParams.origin, searchParams.destination, searchParams.departureDate]);

  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      // Max price filter
      if (flight.basePrice > filters.maxPrice) {
        return false;
      }

      // Stops filter
      if (filters.stops === 'nonstop' && flight.stops !== 0) {
        return false;
      }
      if (filters.stops === 'one-stop' && flight.stops !== 1) {
        return false;
      }

      // Airlines filter
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'cheapest') {
        return a.basePrice - b.basePrice;
      }
      if (filters.sortBy === 'fastest') {
        // Parse "Xh YYm" to total minutes for correct chronological comparison
        const parseDuration = (d: string) => {
          const match = d.match(/(\d+)h\s*(\d+)?m?/);
          if (!match) return 0;
          const hours = parseInt(match[1], 10);
          const minutes = match[2] ? parseInt(match[2], 10) : 0;
          return hours * 60 + minutes;
        };
        return parseDuration(a.duration) - parseDuration(b.duration);
      }
      if (filters.sortBy === 'earliest') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      return 0; // recommended
    });
  }, [flights, filters]);

  const maxAvailablePrice = useMemo(() => {
    const highestPrice = flights.reduce((max, flight) => Math.max(max, flight.basePrice), 0);
    if (highestPrice === 0) return 1_000_000;
    return Math.ceil(highestPrice / 100_000) * 100_000;
  }, [flights]);

  return {
    filters,
    updateFilter,
    filteredFlights,
    allFlights: flights,
    maxAvailablePrice,
    isLoading,
    error
  };
}

function toFlightViewModel(flight: FlightApiModel, activeFares: FareClassResponse[]): BookingFlightSelection {
  const departureAirport = AIRPORTS.find(airport => airport.code === flight.origin);
  const arrivalAirport = AIRPORTS.find(airport => airport.code === flight.destination);
  const departure = new Date(flight.departureTime);
  const arrival = new Date(flight.arrivalTime);
  const durationMinutes = Math.max(0, Math.round((arrival.getTime() - departure.getTime()) / 60_000));

  return {
    id: flight.id,
    flightNumber: flight.flightNumber,
    airline: 'SkyWing Airlines',
    departureCity: departureAirport?.city ?? flight.origin,
    departureAirport: departureAirport?.name ?? flight.origin,
    departureCode: flight.origin,
    departureTime: formatTime(departure),
    departureTerminal: '—',
    arrivalCity: arrivalAirport?.city ?? flight.destination,
    arrivalAirport: arrivalAirport?.name ?? flight.destination,
    arrivalCode: flight.destination,
    arrivalTime: formatTime(arrival),
    arrivalTerminal: '—',
    duration: formatDuration(durationMinutes),
    stops: 0,
    stopDetails: 'Direct Non-stop',
    aircraft: 'Aircraft not specified',
    basePrice: flight.basePrice,
    seatsAvailable: flight.availableSeats,
    onTimeRate: 'N/A',
    status: departure.getTime() > Date.now() ? 'SCHEDULED' : 'DEPARTED',
    fareClasses: buildFareClasses(flight.basePrice, activeFares)
  };
}

function buildFareClasses(basePrice: number, activeFares: FareClassResponse[]): BookingFareOption[] {
  const templateLookup: Record<string, typeof STANDARD_FARE_CLASSES[0]> = {
    ECO: STANDARD_FARE_CLASSES[0],
    ECONOMY: STANDARD_FARE_CLASSES[0],
    PRE: STANDARD_FARE_CLASSES[2],
    PREMIUM: STANDARD_FARE_CLASSES[2],
    BUS: STANDARD_FARE_CLASSES[3],
    BUSINESS: STANDARD_FARE_CLASSES[3],
    FIRST: STANDARD_FARE_CLASSES[3],
  };

  return activeFares
    .filter(fare => fare.active === true)
    .map(fare => {
      const upperCode = fare.code.toUpperCase();
      const matchedKey = Object.keys(templateLookup).find(k => upperCode.includes(k));
      const template = matchedKey ? templateLookup[matchedKey] : null;

      return {
        id: fare.id,
        code: fare.code,
        name: fare.name,
        tier: template?.tier || 'Economy',
        priceMultiplier: fare.priceMultiplier,
        price: Math.round(basePrice * fare.priceMultiplier),
        baggage: template?.baggage || 'Standard baggage allowance',
        seatPitch: template?.seatPitch || 'Standard pitch',
        meal: template?.meal || 'Standard meal options',
        changes: template?.changes || 'Ticket change conditions apply',
        cancellation: template?.cancellation || 'Cancellation conditions apply',
        milesMultiplier: template?.milesMultiplier ?? 1,
        priorityBoarding: template?.priorityBoarding ?? false,
        loungeAccess: template?.loungeAccess ?? false,
        popular: template?.popular,
      };
    });
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}
