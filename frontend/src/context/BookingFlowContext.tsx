import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Flight, FareClass, AncillaryService, Passenger, Booking, FlightSearchParams } from '../types';

export interface BookingFlowContextType {
  searchParams: FlightSearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<FlightSearchParams>>;
  selectedFlight: Flight | null;
  setSelectedFlight: React.Dispatch<React.SetStateAction<Flight | null>>;
  selectedFareClass: FareClass | null;
  setSelectedFareClass: React.Dispatch<React.SetStateAction<FareClass | null>>;
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
  updatePassenger: (index: number, updated: Partial<Passenger>) => void;
  selectedServices: AncillaryService[];
  setSelectedServices?: React.Dispatch<React.SetStateAction<AncillaryService[]>>;
  toggleService: (service: AncillaryService) => void;
  paymentMethod: 'card' | 'bank' | 'wallet';
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'bank' | 'wallet'>>;
  priceSummary: {
    flightPrice: number;
    baseTotal: number;
    taxesAndFees: number;
    servicesTotal: number;
    discount: number;
    grandTotal: number;
  };
  confirmedBooking: Booking | null;
  confirmBooking: () => Booking | null;
  resetDraft: () => void;
}

export const BookingFlowContext = createContext<BookingFlowContextType | undefined>(undefined);

export const BookingFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    tripType: 'one-way',
    origin: 'SGN',
    destination: 'HAN',
    departureDate: '2026-10-15',
    passengers: 1,
    cabinClass: 'Economy',
  });

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedFareClass, setSelectedFareClass] = useState<FareClass | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedServices, setSelectedServices] = useState<AncillaryService[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'wallet'>('card');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const toggleService = useCallback((service: AncillaryService) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  }, []);

  const updatePassenger = useCallback((index: number, updated: Partial<Passenger>) => {
    setPassengers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
  }, []);

  const priceSummary = useMemo(() => {
    const flightPrice = selectedFareClass ? selectedFareClass.price : (selectedFlight?.basePrice ?? 0);
    const baseTotal = flightPrice * passengers.length;
    const taxesAndFees = Math.round(baseTotal * 0.12);
    const servicesTotal = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
    const discount = 0;
    const grandTotal = baseTotal + taxesAndFees + servicesTotal - discount;

    return {
      flightPrice,
      baseTotal,
      taxesAndFees,
      servicesTotal,
      discount,
      grandTotal,
    };
  }, [selectedFlight, selectedFareClass, passengers, selectedServices]);

  const confirmBooking = useCallback(() => {
    if (!selectedFlight || !selectedFareClass) return null;
    if (passengers.length === 0) return null;

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
      seatAssignment: '03A',
    };

    setConfirmedBooking(newBooking);
    return newBooking;
  }, [selectedFlight, selectedFareClass, passengers, selectedServices, searchParams, priceSummary, paymentMethod]);

  const resetDraft = useCallback(() => {
    setSelectedFlight(null);
    setSelectedFareClass(null);
    setPassengers([]);
    setSelectedServices([]);
    setPaymentMethod('card');
    setConfirmedBooking(null);
  }, []);

  const value = useMemo(
    () => ({
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
      setSelectedServices,
      toggleService,
      paymentMethod,
      setPaymentMethod,
      priceSummary,
      confirmedBooking,
      confirmBooking,
      resetDraft,
    }),
    [
      searchParams,
      selectedFlight,
      selectedFareClass,
      passengers,
      updatePassenger,
      selectedServices,
      toggleService,
      paymentMethod,
      priceSummary,
      confirmedBooking,
      confirmBooking,
      resetDraft,
    ]
  );

  return <BookingFlowContext.Provider value={value}>{children}</BookingFlowContext.Provider>;
};

export function useBookingFlowContext(): BookingFlowContextType {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error('useBookingFlow must be used within a BookingFlowProvider');
  }
  return context;
}
