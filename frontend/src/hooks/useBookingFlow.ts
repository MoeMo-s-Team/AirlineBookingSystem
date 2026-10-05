import { useState, useCallback, useMemo } from 'react';
import { Flight, FareClass, AncillaryService, Passenger, Booking, FlightSearchParams } from '../types';
import { MOCK_FLIGHTS, STANDARD_FARE_CLASSES, MOCK_SERVICES, MOCK_PASSENGERS } from '../data/mockData';

export function useBookingFlow() {
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    tripType: 'round-trip',
    origin: 'SGN',
    destination: 'HAN',
    departureDate: '2026-10-15',
    returnDate: '2026-10-22',
    passengers: 1,
    cabinClass: 'Economy'
  });

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(MOCK_FLIGHTS[0]);
  const [selectedFareClass, setSelectedFareClass] = useState<FareClass | null>(STANDARD_FARE_CLASSES[1]); // Economy Flex
  const [passengers, setPassengers] = useState<Passenger[]>([MOCK_PASSENGERS[0]]);
  const [selectedServices, setSelectedServices] = useState<AncillaryService[]>([MOCK_SERVICES[0]]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'wallet'>('card');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Toggle ancillary service
  const toggleService = useCallback((service: AncillaryService) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  }, []);

  // Update passenger details
  const updatePassenger = useCallback((index: number, updated: Partial<Passenger>) => {
    setPassengers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
  }, []);

  // Compute pricing totals
  const priceSummary = useMemo(() => {
    const flightPrice = selectedFareClass ? selectedFareClass.price : (selectedFlight?.basePrice ?? 0);
    const baseTotal = flightPrice * passengers.length;
    const taxesAndFees = Math.round(baseTotal * 0.12);
    const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const discount = 0;
    const grandTotal = baseTotal + taxesAndFees + servicesTotal - discount;

    return {
      flightPrice,
      baseTotal,
      taxesAndFees,
      servicesTotal,
      discount,
      grandTotal
    };
  }, [selectedFlight, selectedFareClass, passengers, selectedServices]);

  // Complete checkout & generate confirmed booking
  const confirmBooking = useCallback(() => {
    if (!selectedFlight || !selectedFareClass) return null;
    if (passengers.length === 0) return null; // Must have at least one passenger

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pnr = 'SW';
    for (let i = 0; i < 4; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newBooking: Booking = {
      pnr,
      flight: selectedFlight,
      fareClass: selectedFareClass,
      passengers,
      services: selectedServices,
      tripType: searchParams.tripType,
      departureDate: searchParams.departureDate,
      returnDate: searchParams.returnDate,
      baseFare: priceSummary.baseTotal,
      taxesAndFees: priceSummary.taxesAndFees,
      servicesTotal: priceSummary.servicesTotal,
      discount: priceSummary.discount,
      grandTotal: priceSummary.grandTotal,
      status: 'CONFIRMED',
      bookingDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod === 'card' ? 'Visa •••• 8812' : paymentMethod === 'bank' ? 'VietQR Transfer' : 'Apple Pay',
      paymentStatus: 'PAID',
      gate: 'Gate ' + (Math.floor(Math.random() * 18) + 1),
      seatAssignment: '03A'
    };

    setConfirmedBooking(newBooking);
    return newBooking;
  }, [selectedFlight, selectedFareClass, passengers, selectedServices, searchParams, priceSummary, paymentMethod]);

  return {
    searchParams,
    setSearchParams,
    selectedFlight,
    setSelectedFlight,
    selectedFareClass,
    setSelectedFareClass,
    passengers,
    setPassengers,
    updatePassenger,
    selectedServices,
    toggleService,
    paymentMethod,
    setPaymentMethod,
    priceSummary,
    confirmedBooking,
    confirmBooking
  };
}
