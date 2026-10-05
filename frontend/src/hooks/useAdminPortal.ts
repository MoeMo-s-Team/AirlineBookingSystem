import { useState, useCallback } from 'react';
import { Flight, Booking, AncillaryService, FareClass } from '../types';
import { MOCK_FLIGHTS, MOCK_BOOKINGS, MOCK_SERVICES, STANDARD_FARE_CLASSES, MOCK_ADMIN_METRICS } from '../data/mockData';

export function useAdminPortal() {
  const [flights, setFlights] = useState<Flight[]>([...MOCK_FLIGHTS]);
  const [bookings, setBookings] = useState<Booking[]>([...MOCK_BOOKINGS]);
  const [services, setServices] = useState<AncillaryService[]>([...MOCK_SERVICES]);
  const [fareClasses, setFareClasses] = useState<FareClass[]>([...STANDARD_FARE_CLASSES]);
  const [metrics] = useState(MOCK_ADMIN_METRICS);

  // Update flight status
  const updateFlightStatus = useCallback((flightId: string, status: Flight['status']) => {
    setFlights(prev => prev.map(f => (f.id === flightId ? { ...f, status } : f)));
  }, []);

  // Cancel booking
  const cancelBooking = useCallback((pnr: string) => {
    setBookings(prev => prev.map(b => (b.pnr === pnr ? { ...b, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : b)));
  }, []);

  // Toggle service availability
  const toggleServiceActive = useCallback((serviceId: string) => {
    setServices(prev => prev.map(s => (s.id === serviceId ? { ...s, active: !s.active } : s)));
  }, []);

  // Update fare class price
  const updateFareClassPrice = useCallback((fareId: string, newPrice: number) => {
    setFareClasses(prev => prev.map(fc => (fc.id === fareId ? { ...fc, price: newPrice } : fc)));
  }, []);

  return {
    flights,
    bookings,
    services,
    fareClasses,
    metrics,
    updateFlightStatus,
    cancelBooking,
    toggleServiceActive,
    updateFareClassPrice
  };
}
