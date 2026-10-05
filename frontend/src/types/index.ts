export interface FareClass {
  readonly id: string;
  readonly tier: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  readonly name: string;
  readonly price: number;
  readonly baggage: string;
  readonly seatPitch: string;
  readonly meal: string;
  readonly changes: string;
  readonly cancellation: string;
  readonly milesMultiplier: number;
  readonly priorityBoarding: boolean;
  readonly loungeAccess: boolean;
  readonly popular?: boolean;
}

export interface Flight {
  readonly id: string;
  readonly flightNumber: string;
  readonly airline: string;
  readonly airlineLogo?: string;
  readonly departureCity: string;
  readonly departureAirport: string;
  readonly departureCode: string;
  readonly departureTime: string;
  readonly departureTerminal: string;
  readonly arrivalCity: string;
  readonly arrivalAirport: string;
  readonly arrivalCode: string;
  readonly arrivalTime: string;
  readonly arrivalTerminal: string;
  readonly duration: string;
  readonly stops: number;
  readonly stopDetails?: string;
  readonly aircraft: string;
  readonly basePrice: number;
  readonly seatsAvailable: number;
  readonly onTimeRate: string;
  readonly status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'DELAYED' | 'CANCELLED';
  readonly fareClasses: readonly FareClass[];
}

export interface Passenger {
  readonly id: string;
  readonly title: 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: string;
  readonly nationality: string;
  readonly passportNumber: string;
  readonly passportExpiry: string;
  readonly email: string;
  readonly phone: string;
  readonly seatNumber?: string;
  readonly frequentFlyerNumber?: string;
  readonly mealPreference?: string;
  readonly specialAssistance?: string;
}

export interface AncillaryService {
  readonly id: string;
  readonly name: string;
  readonly category: 'baggage' | 'meal' | 'seat' | 'lounge' | 'priority' | 'insurance';
  readonly description: string;
  readonly price: number;
  readonly icon: string;
  readonly badge?: string;
  readonly limitPerBooking?: number;
  readonly selected?: boolean;
  readonly active?: boolean;
}

export interface Booking {
  readonly pnr: string;
  readonly flight: Flight;
  readonly fareClass: FareClass;
  readonly passengers: readonly Passenger[];
  readonly services: readonly AncillaryService[];
  readonly tripType: 'round-trip' | 'one-way' | 'multi-city';
  readonly departureDate: string;
  readonly returnDate?: string;
  readonly returnFlight?: Flight;
  readonly baseFare: number;
  readonly taxesAndFees: number;
  readonly servicesTotal: number;
  readonly discount: number;
  readonly grandTotal: number;
  readonly status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  readonly bookingDate: string;
  readonly paymentMethod: string;
  readonly paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  readonly gate?: string;
  readonly seatAssignment?: string;
}

export interface FlightSearchParams {
  readonly tripType: 'round-trip' | 'one-way' | 'multi-city';
  readonly origin: string;
  readonly destination: string;
  readonly departureDate: string;
  readonly returnDate?: string;
  readonly passengers: number;
  readonly cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
}

export interface FlightFilterOptions {
  readonly maxPrice: number;
  readonly stops: 'all' | 'nonstop' | 'one-stop';
  readonly departureTimeRange: 'all' | 'morning' | 'afternoon' | 'evening';
  readonly airlines: readonly string[];
  readonly sortBy: 'cheapest' | 'fastest' | 'earliest' | 'recommended';
}

export interface AdminMetrics {
  readonly activeFlights: number;
  readonly flightsChange: string;
  readonly totalBookingsToday: number;
  readonly bookingsChange: string;
  readonly revenueToday: number;
  readonly revenueChange: string;
  readonly averageLoadFactor: number;
  readonly loadFactorChange: string;
  readonly onTimePercentage: number;
}

export interface UserAccount {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password?: string;
  readonly role: 'customer' | 'admin';
  readonly frequentFlyerNumber: string;
  readonly tier: 'Classic' | 'Silver' | 'Gold' | 'Platinum';
  readonly phone: string;
  readonly associatedPnr?: readonly string[];
}

