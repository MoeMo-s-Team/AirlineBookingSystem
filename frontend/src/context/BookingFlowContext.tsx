import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { FlightSearchParams } from '../types';
import { localToday } from '../utils/flightSearch';
import { bundleEligible, serviceDiscount } from '../utils/serviceBundle';
import type {
  BookingFlightSelection,
  BookingFareOption,
  BookingPassengerDraft,
  BookingSelectedService,
} from '../types/bookingFlow';

export interface BookingFlowContextType {
  searchParams: FlightSearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<FlightSearchParams>>;
  selectedFlight: BookingFlightSelection | null;
  setSelectedFlight: React.Dispatch<React.SetStateAction<BookingFlightSelection | null>>;
  selectedFareClass: BookingFareOption | null;
  selectedReturnFlight: BookingFlightSelection | null;
  setSelectedReturnFlight: React.Dispatch<React.SetStateAction<BookingFlightSelection | null>>;
  selectedReturnFareClass: BookingFareOption | null;
  setSelectedReturnFareClass: React.Dispatch<React.SetStateAction<BookingFareOption | null>>;
  setSelectedFareClass: React.Dispatch<React.SetStateAction<BookingFareOption | null>>;
  passengers: BookingPassengerDraft[];
  setPassengers: React.Dispatch<React.SetStateAction<BookingPassengerDraft[]>>;
  updatePassenger: (index: number, updated: Partial<BookingPassengerDraft>) => void;
  selectedServices: BookingSelectedService[];
  serviceBundle: boolean;
  setServiceBundle: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedServices?: React.Dispatch<React.SetStateAction<BookingSelectedService[]>>;
  toggleService: (service: BookingSelectedService) => void;
  updateServiceQuantity: (serviceId: number, quantity: number) => void;
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
  confirmedBooking: any | null;
  confirmBooking: () => any | null;
  resetDraft: () => void;
}

export const BookingFlowContext = createContext<BookingFlowContextType | undefined>(undefined);

export const BookingFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    tripType: 'one-way',
    origin: 'SGN',
    destination: 'HAN',
    departureDate: localToday(),
    passengers: 1,
    cabinClass: 'Economy',
  });

  const [selectedFlight, setSelectedFlight] = useState<BookingFlightSelection | null>(null);
  const [selectedFareClass, setSelectedFareClass] = useState<BookingFareOption | null>(null);
  const [passengers, setPassengers] = useState<BookingPassengerDraft[]>([]);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<BookingFlightSelection | null>(null);
  const [selectedReturnFareClass, setSelectedReturnFareClass] = useState<BookingFareOption | null>(null);
  const [selectedServices, setSelectedServices] = useState<BookingSelectedService[]>([]);
  const [serviceBundle, setServiceBundle] = useState(false);
  const appliedBundle = serviceBundle && bundleEligible(selectedServices);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'wallet'>('card');
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  const toggleService = useCallback((service: BookingSelectedService) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => String(s.id) === String(service.id));
      if (exists) {
        return prev.filter(s => String(s.id) !== String(service.id));
      }
      return [...prev, { ...service, quantity: service.quantity || 1 }];
    });
  }, []);

  const updateServiceQuantity = useCallback((serviceId: number, quantity: number) => {
    setSelectedServices(prev => {
      if (quantity <= 0) {
        return prev.filter(s => Number(s.id) !== Number(serviceId));
      }
      return prev.map(s => {
        if (Number(s.id) === Number(serviceId)) {
          return { ...s, quantity };
        }
        return s;
      });
    });
  }, []);

  const updatePassenger = useCallback((index: number, updated: Partial<BookingPassengerDraft>) => {
    setPassengers(prev => {
      const next = [...prev];
      if (!next[index]) {
        next[index] = {
          fullName: '',
          dateOfBirth: '',
          passportNo: '',
          phone: '',
          ...updated,
        };
      } else {
        next[index] = { ...next[index], ...updated };
      }
      return next;
    });
  }, []);

  const priceSummary = useMemo(() => {
    const flightPrice = (selectedFareClass ? selectedFareClass.price : (selectedFlight?.basePrice ?? 0))
      + (selectedReturnFareClass?.price ?? 0);
    const count = passengers.length > 0 ? passengers.length : (searchParams.passengers || 1);
    const baseTotal = flightPrice * count;
    const taxesAndFees = 0;
    const servicesTotal = selectedServices.reduce((sum, s) => sum + (s.price || 0) * (s.quantity || 1), 0);
    const discount = serviceDiscount(selectedServices, appliedBundle);
    const grandTotal = baseTotal + servicesTotal - discount;

    return {
      flightPrice,
      baseTotal,
      taxesAndFees,
      servicesTotal,
      discount,
      grandTotal,
    };
  }, [selectedFlight, selectedFareClass, selectedReturnFareClass, passengers, searchParams.passengers, selectedServices, appliedBundle]);

  const confirmBooking = useCallback(() => {
    if (!selectedFlight || !selectedFareClass) return null;
    return null;
  }, [selectedFlight, selectedFareClass]);

  const resetDraft = useCallback(() => {
    setSelectedFlight(null);
    setSelectedFareClass(null);
    setSelectedReturnFlight(null);
    setSelectedReturnFareClass(null);
    setPassengers([]);
    setSelectedServices([]);
    setServiceBundle(false);
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
      selectedReturnFlight,
      setSelectedReturnFlight,
      selectedReturnFareClass,
      setSelectedReturnFareClass,
      setSelectedFareClass,
      passengers,
      setPassengers,
      updatePassenger,
      selectedServices,
      serviceBundle: appliedBundle,
      setServiceBundle,
      setSelectedServices,
      toggleService,
      updateServiceQuantity,
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
      selectedReturnFlight,
      selectedReturnFareClass,
      passengers,
      updatePassenger,
      selectedServices,
      appliedBundle,
      toggleService,
      updateServiceQuantity,
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
