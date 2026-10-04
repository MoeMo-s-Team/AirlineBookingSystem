import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { SearchFormData } from '@/components/features/SearchConsole/SearchConsole';
import type { FlightData } from '@/components/features/FlightCard/FlightCard';
import type { ServiceData } from '@/components/features/ServiceCard/ServiceCard';

export interface PassengerInfo {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  email: string;
  phone: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface BookingState {
  searchData: SearchFormData | null;
  selectedFlight: FlightData | null;
  passengers: PassengerInfo[];
  selectedServices: ServiceData[];
  contactInfo: ContactInfo | null;
}

export type BookingAction =
  | { type: 'SET_SEARCH'; payload: SearchFormData }
  | { type: 'SELECT_FLIGHT'; payload: FlightData }
  | { type: 'ADD_PASSENGER'; payload: PassengerInfo }
  | { type: 'UPDATE_PASSENGER'; payload: { id: string; data: Partial<PassengerInfo> } }
  | { type: 'REMOVE_PASSENGER'; payload: string }
  | { type: 'ADD_SERVICE'; payload: ServiceData }
  | { type: 'REMOVE_SERVICE'; payload: string }
  | { type: 'SET_CONTACT'; payload: ContactInfo }
  | { type: 'RESET' };

export const initialBookingState: BookingState = {
  searchData: null,
  selectedFlight: null,
  passengers: [],
  selectedServices: [],
  contactInfo: null,
};

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, searchData: action.payload };
    case 'SELECT_FLIGHT':
      return { ...state, selectedFlight: action.payload };
    case 'ADD_PASSENGER':
      return { ...state, passengers: [...state.passengers, action.payload] };
    case 'UPDATE_PASSENGER':
      return {
        ...state,
        passengers: state.passengers.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.data } : p
        ),
      };
    case 'REMOVE_PASSENGER':
      return {
        ...state,
        passengers: state.passengers.filter((p) => p.id !== action.payload),
      };
    case 'ADD_SERVICE':
      return { ...state, selectedServices: [...state.selectedServices, action.payload] };
    case 'REMOVE_SERVICE':
      return {
        ...state,
        selectedServices: state.selectedServices.filter((s) => s.id !== action.payload),
      };
    case 'SET_CONTACT':
      return { ...state, contactInfo: action.payload };
    case 'RESET':
      return initialBookingState;
    default:
      return state;
  }
}

export interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  totalPassengers: number;
  totalServicesPrice: number;
  grandTotal: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);

  const searchPassengerCount = state.searchData?.passengers
    ? (state.searchData.passengers.adults || 0) +
      (state.searchData.passengers.children || 0) +
      (state.searchData.passengers.infants || 0)
    : 0;

  const totalPassengers =
    searchPassengerCount > 0
      ? searchPassengerCount
      : state.passengers.length > 0
      ? state.passengers.length
      : 1;

  const totalServicesPrice = state.selectedServices.reduce((sum, s) => sum + s.price, 0);

  const grandTotal = (state.selectedFlight?.price || 0) * totalPassengers + totalServicesPrice;

  return (
    <BookingContext.Provider
      value={{
        state,
        dispatch,
        totalPassengers,
        totalServicesPrice,
        grandTotal,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
