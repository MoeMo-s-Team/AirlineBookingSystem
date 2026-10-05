import { useState, useMemo } from 'react';
import { FlightFilterOptions } from '../types';
import { MOCK_FLIGHTS } from '../data/mockData';

export function useFlights(initialOrigin = 'SGN', initialDestination = 'HAN') {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);

  const [filters, setFilters] = useState<FlightFilterOptions>({
    maxPrice: 300,
    stops: 'all',
    departureTimeRange: 'all',
    airlines: [],
    sortBy: 'recommended'
  });

  const updateFilter = <K extends keyof FlightFilterOptions>(key: K, value: FlightFilterOptions[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredFlights = useMemo(() => {
    return MOCK_FLIGHTS.filter(flight => {
      // Origin and destination matching
      if (origin && flight.departureCode !== origin) {
        return false;
      }
      if (destination && flight.arrivalCode !== destination) {
        return false;
      }

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
  }, [origin, destination, filters]);

  return {
    origin,
    setOrigin,
    destination,
    setDestination,
    filters,
    updateFilter,
    filteredFlights,
    allFlights: MOCK_FLIGHTS
  };
}
