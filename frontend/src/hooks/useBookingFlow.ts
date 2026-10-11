import { createContext, createElement, useCallback, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { BookingDetailResponse } from '../api/bookingApi';
import { PaymentResponse } from '../api/paymentApi';
import { AncillaryService, Booking, FareClass, Flight, FlightSearchParams, Passenger } from '../types';

interface BookingFlowValue {
  searchParams: FlightSearchParams;
  setSearchParams: Dispatch<SetStateAction<FlightSearchParams>>;
  selectedFlight: Flight | null;
  setSelectedFlight: Dispatch<SetStateAction<Flight | null>>;
  selectedFareClass: FareClass | null;
  setSelectedFareClass: Dispatch<SetStateAction<FareClass | null>>;
  passengers: Passenger[];
  setPassengers: Dispatch<SetStateAction<Passenger[]>>;
  updatePassenger: (index: number, updated: Partial<Passenger>) => void;
  selectedServices: AncillaryService[];
  toggleService: (service: AncillaryService) => void;
  paymentMethod: 'card' | 'bank';
  setPaymentMethod: Dispatch<SetStateAction<'card' | 'bank'>>;
  priceSummary: { flightPrice: number; baseTotal: number; taxesAndFees: number; servicesTotal: number; discount: number; grandTotal: number };
  confirmedBooking: Booking | null;
  completeBooking: (booking: BookingDetailResponse, payment: PaymentResponse) => void;
}

const BookingFlowContext = createContext<BookingFlowValue | null>(null);

export function BookingFlowProvider({ children }: { readonly children: ReactNode }) {
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    tripType: 'one-way', origin: 'SGN', destination: 'HAN', departureDate: '', passengers: 1, cabinClass: 'Economy'
  });
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedFareClass, setSelectedFareClass] = useState<FareClass | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedServices, setSelectedServices] = useState<AncillaryService[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const toggleService = useCallback((service: AncillaryService) => setSelectedServices(prev =>
    prev.some(item => item.id === service.id) ? prev.filter(item => item.id !== service.id) : [...prev, service]
  ), []);
  const updatePassenger = useCallback((index: number, updated: Partial<Passenger>) => setPassengers(prev => {
    const next = [...prev];
    next[index] = { ...next[index], ...updated };
    return next;
  }), []);

  const priceSummary = useMemo(() => {
    const flightPrice = selectedFareClass?.price ?? selectedFlight?.basePrice ?? 0;
    const baseTotal = flightPrice * passengers.length;
    const servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
    return { flightPrice, baseTotal, taxesAndFees: 0, servicesTotal, discount: 0, grandTotal: baseTotal + servicesTotal };
  }, [selectedFlight, selectedFareClass, passengers, selectedServices]);

  const completeBooking = useCallback((response: BookingDetailResponse, payment: PaymentResponse) => {
    if (!selectedFlight || !selectedFareClass) throw new Error('Chưa chọn chuyến bay và hạng vé.');
    const passengersFromResponse = response.passengers.map((passenger, index) => {
      const names = passenger.fullName.trim().split(/\s+/);
      return { ...passengers[index], firstName: names.slice(0, -1).join(' ') || names[0], lastName: names.length > 1 ? names[names.length - 1] : '' };
    });
    setConfirmedBooking({
      pnr: response.bookingCode,
      flight: selectedFlight,
      fareClass: selectedFareClass,
      passengers: passengersFromResponse,
      services: selectedServices,
      tripType: searchParams.tripType,
      departureDate: response.flight.departureTime.slice(0, 10),
      baseFare: response.priceBreakdown.baseFare,
      taxesAndFees: 0,
      servicesTotal: response.priceBreakdown.servicesTotal,
      discount: 0,
      grandTotal: response.totalPrice,
      status: response.status,
      bookingDate: response.createdAt.slice(0, 10),
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.status === 'SUCCESS' ? 'PAID' : 'PENDING'
    });
  }, [selectedFlight, selectedFareClass, selectedServices, searchParams.tripType]);

  const value = useMemo(() => ({
    searchParams, setSearchParams, selectedFlight, setSelectedFlight, selectedFareClass, setSelectedFareClass,
    passengers, setPassengers, updatePassenger, selectedServices, toggleService, paymentMethod, setPaymentMethod,
    priceSummary, confirmedBooking, completeBooking
  }), [searchParams, selectedFlight, selectedFareClass, passengers, updatePassenger, selectedServices, toggleService, paymentMethod, priceSummary, confirmedBooking, completeBooking]);

  return createElement(BookingFlowContext.Provider, { value }, children);
}

export function useBookingFlow(): BookingFlowValue {
  const value = useContext(BookingFlowContext);
  if (!value) throw new Error('useBookingFlow must be used inside BookingFlowProvider.');
  return value;
}
