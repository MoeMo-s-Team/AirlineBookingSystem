import { useEffect, useMemo, useState } from 'react';
import { searchFlights, FlightApiModel } from '../api/flightApi';
import { AIRPORTS, STANDARD_FARE_CLASSES } from '../data/mockData';
import { Flight, FlightFilterOptions, FlightSearchParams } from '../types';

export function useFlights(searchParams: FlightSearchParams) {
  const [flights, setFlights] = useState<readonly Flight[]>([]);
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

    searchFlights({
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: searchParams.departureDate
    }, controller.signal)
      .then(result => setFlights(result.map(toFlightViewModel)))
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

function toFlightViewModel(flight: FlightApiModel): Flight {
  const departureAirport = AIRPORTS.find(airport => airport.code === flight.origin);
  const arrivalAirport = AIRPORTS.find(airport => airport.code === flight.destination);
  const departure = new Date(flight.departureTime);
  const arrival = new Date(flight.arrivalTime);
  const durationMinutes = Math.max(0, Math.round((arrival.getTime() - departure.getTime()) / 60_000));

  return {
    id: String(flight.id),
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
    basePrice: flight.prices.economy ?? flight.basePrice,
    seatsAvailable: flight.availableSeats,
    onTimeRate: 'N/A',
    status: departure.getTime() > Date.now() ? 'SCHEDULED' : 'DEPARTED',
    fareClasses: buildFareClasses(flight.prices)
  };
}

function buildFareClasses(prices: Readonly<Record<string, number>>) {
  const templatesByCode = {
    economy: STANDARD_FARE_CLASSES[0],
    premium: STANDARD_FARE_CLASSES[2],
    business: STANDARD_FARE_CLASSES[3]
  } as const;

  return Object.entries(templatesByCode).flatMap(([code, template]) => {
    const price = prices[code];
    return price == null ? [] : [{ ...template, id: code, price }];
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
