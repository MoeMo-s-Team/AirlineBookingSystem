import type { Flight, FareClass } from './index';
import type { ServiceResponse } from '../api/serviceApi';

export interface BookingFareOption extends Omit<FareClass, 'id'> {
  id: number;
  code: string;
  priceMultiplier: number;
  price: number;
}

export interface BookingFlightSelection extends Omit<Flight, 'id' | 'fareClasses'> {
  id: number;
  fareClasses: BookingFareOption[];
}

export interface BookingPassengerDraft {
  fullName: string;
  dateOfBirth: string;
  passportNo: string;
  phone: string;
}

export type BookingSelectedService = ServiceResponse;
