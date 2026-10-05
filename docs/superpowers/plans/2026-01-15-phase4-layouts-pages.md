# Phase 4: Layouts, Pages & Routing - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 4 layouts, 16 pages, 2 context providers, 7 mock data files, and configure routing for the SkyWing Airlines booking system.

**Architecture:**
- Layouts wrap pages with consistent structure (header, sidebar, progress)
- Context providers manage global state (auth, booking flow)
- Mock data files provide realistic sample data for development
- React Router handles navigation with protected routes

**Tech Stack:** React 18+, TypeScript, Tailwind CSS, React Router v6, Vitest

**Spec:** Phase 1 Design Tokens, Phase 2 Atomic Components, Phase 3 Composite Components

## Global Constraints

- All pages use CSS variables from Phase 1
- All pages import from atomic (Phase 2) and feature (Phase 3) components
- Admin routes protected by role-based check
- Booking state managed via Context API + useReducer
- Mobile-first responsive design with Tailwind breakpoints

## Review Focus

- Auth: Login form validation prevents empty submissions
- Booking flow: State persists correctly across navigation
- Admin: Unauthorized users redirected to login
- Routing: Deep links work correctly for booking details
- Mock data: All data types match component interfaces

---

## Task 1: Create Mock Data Files

**Files:**
- Create: `frontend/src/mocks/airports.ts`
- Create: `frontend/src/mocks/flights.ts`
- Create: `frontend/src/mocks/passengers.ts`
- Create: `frontend/src/mocks/services.ts`
- Create: `frontend/src/mocks/fares.ts`
- Create: `frontend/src/mocks/bookings.ts`
- Create: `frontend/src/mocks/users.ts`
- Create: `frontend/src/mocks/index.ts`

**Interfaces:**
- Produces: Mock data for all pages

---

### Task 1: Create Mock Data Files

**Requirements & Acceptance Criteria:**
- [ ] 10+ Vietnamese airports with IATA codes
- [ ] 20+ flight records with realistic data
- [ ] Passenger type definitions
- [ ] 10+ additional services
- [ ] 4 fare classes (Economy, Premium, Business, First)
- [ ] 5+ user bookings
- [ ] 3 user accounts (customer, admin)

- [ ] **Step 1: Create airports mock data**

```tsx
// frontend/src/mocks/airports.ts
import type { Airport } from '@/components/features/AirportPicker/types';

export const airports: Airport[] = [
  {
    code: 'HAN',
    name: 'Noi Bai International Airport',
    city: 'Hanoi',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'SGN',
    name: 'Tan Son Nhat International Airport',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'DAD',
    name: 'Da Nang International Airport',
    city: 'Da Nang',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'CXR',
    name: 'Cam Ranh International Airport',
    city: 'Cam Ranh',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'HPH',
    name: 'Cat Bi International Airport',
    city: 'Hai Phong',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'VDH',
    name: 'Dong Hoi Airport',
    city: 'Dong Hoi',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'THD',
    name: 'Tho Xuan Airport',
    city: 'Thanh Hoa',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'VII',
    name: 'Vinh Airport',
    city: 'Vinh',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'PQC',
    name: 'Phu Quoc International Airport',
    city: 'Phu Quoc',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'DLI',
    name: 'Lien Khuong Airport',
    city: 'Da Lat',
    country: 'Vietnam',
    countryCode: 'VN',
  },
];

export const popularAirports = [airports[0], airports[1], airports[2]]; // HAN, SGN, DAD
```

- [ ] **Step 2: Create flights mock data**

```tsx
// frontend/src/mocks/flights.ts
import type { FlightData } from '@/components/features/FlightCard/FlightCard';

export const flights: FlightData[] = [
  {
    id: '1',
    flightNumber: 'VN1234',
    airline: 'SkyWing Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    departure: {
      airport: 'HAN',
      time: '06:00',
      date: '2026-06-15',
    },
    arrival: {
      airport: 'SGN',
      time: '08:30',
      date: '2026-06-15',
    },
    duration: '2h 30m',
    stops: 0,
    price: 3460000,
    cabinClass: 'economy',
    seatsAvailable: 12,
  },
  {
    id: '2',
    flightNumber: 'VN5678',
    airline: 'SkyWing Airlines',
    aircraft: 'Airbus A350-900',
    departure: {
      airport: 'HAN',
      time: '08:15',
      date: '2026-06-15',
    },
    arrival: {
      airport: 'SGN',
      time: '10:45',
      date: '2026-06-15',
    },
    duration: '2h 30m',
    stops: 0,
    price: 4120000,
    cabinClass: 'economy',
    seatsAvailable: 45,
  },
  {
    id: '3',
    flightNumber: 'VN9012',
    airline: 'SkyWing Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    departure: {
      airport: 'HAN',
      time: '11:30',
      date: '2026-06-15',
    },
    arrival: {
      airport: 'SGN',
      time: '14:00',
      date: '2026-06-15',
    },
    duration: '2h 30m',
    stops: 0,
    price: 3890000,
    cabinClass: 'economy',
    seatsAvailable: 8,
  },
  {
    id: '4',
    flightNumber: 'VN3456',
    airline: 'SkyWing Airlines',
    aircraft: 'Airbus A321neo',
    departure: {
      airport: 'HAN',
      time: '14:00',
      date: '2026-06-15',
    },
    arrival: {
      airport: 'SGN',
      time: '16:30',
      date: '2026-06-15',
    },
    duration: '2h 30m',
    stops: 0,
    price: 3650000,
    cabinClass: 'economy',
    seatsAvailable: 67,
  },
  {
    id: '5',
    flightNumber: 'VN7890',
    airline: 'SkyWing Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    departure: {
      airport: 'HAN',
      time: '17:45',
      date: '2026-06-15',
    },
    arrival: {
      airport: 'SGN',
      time: '20:15',
      date: '2026-06-15',
    },
    duration: '2h 30m',
    stops: 0,
    price: 3250000,
    cabinClass: 'economy',
    seatsAvailable: 120,
  },
  {
    id: '6',
    flightNumber: 'VJ123',
    airline: 'VietJet Air',
    aircraft: 'Airbus A321neo',
    departure: {
      airport: 'HAN',
      time: '07:00',
      date: '2026-06-15',
    },
    arrival: {
      airport: 'SGN',
      time: '09:30',
      date: '2026-06-15',
    },
    duration: '2h 30m',
    stops: 0,
    price: 2890000,
    cabinClass: 'economy',
    seatsAvailable: 34,
  },
];
```

- [ ] **Step 3: Create services mock data**

```tsx
// frontend/src/mocks/services.ts
import type { ServiceData } from '@/components/features/ServiceCard/ServiceCard';

export const services: ServiceData[] = [
  {
    id: 'svc-1',
    name: 'Extra Baggage (20kg)',
    description: 'Additional 20kg piece for checked luggage. Max dimension 158cm total. Save up to 40% vs airport counter rate.',
    price: 500000,
    icon: 'luggage',
    category: 'baggage',
  },
  {
    id: 'svc-2',
    name: 'Priority Check-in',
    description: 'Skip the regular check-in queue with dedicated priority counter access.',
    price: 150000,
    icon: 'speed',
    category: 'priority',
  },
  {
    id: 'svc-3',
    name: 'Standard Meal',
    description: 'Complimentary in-flight meal with Vietnamese and international options.',
    price: 0,
    icon: 'restaurant',
    category: 'meal',
  },
  {
    id: 'svc-4',
    name: 'Premium Meal',
    description: 'Gourmet dining experience with premium ingredients and wine selection.',
    price: 350000,
    icon: 'dinner_dining',
    category: 'meal',
  },
  {
    id: 'svc-5',
    name: 'Window Seat',
    description: 'Reserve your preferred window seat for scenic views.',
    price: 100000,
    icon: 'airline_seat_recline_normal',
    category: 'seat',
  },
  {
    id: 'svc-6',
    name: 'Extra Legroom',
    description: 'Premium seat with 50% more legroom for maximum comfort.',
    price: 250000,
    icon: 'airline_seat_legroom_extra',
    category: 'seat',
  },
  {
    id: 'svc-7',
    name: 'Travel Insurance',
    description: 'Comprehensive coverage including flight delay, cancellation, and medical emergencies.',
    price: 199000,
    icon: 'health_and_safety',
    category: 'insurance',
  },
];
```

- [ ] **Step 4: Create fares mock data**

```tsx
// frontend/src/mocks/fares.ts
export interface FareClass {
  id: string;
  code: string;
  name: string;
  description: string;
  amenities: string[];
  priceMultiplier: number;
}

export const fareClasses: FareClass[] = [
  {
    id: 'fare-1',
    code: 'ECO',
    name: 'Economy Class',
    description: 'Comfortable travel with essential amenities',
    amenities: [
      'Personal entertainment system',
      'Complimentary snacks and beverages',
      'Standard baggage allowance (23kg)',
      'Seat selection available',
    ],
    priceMultiplier: 1.0,
  },
  {
    id: 'fare-2',
    code: 'PREM',
    name: 'Premium Economy',
    description: 'Enhanced comfort with priority services',
    amenities: [
      'Wider seats with extra legroom',
      'Priority check-in',
      'Premium meal service',
      'Increased baggage allowance (32kg)',
      'Priority boarding',
    ],
    priceMultiplier: 1.5,
  },
  {
    id: 'fare-3',
    code: 'BIZ',
    name: 'Business Class',
    description: 'Full business experience with premium perks',
    amenities: [
      'Lie-flat seats',
      'Dedicated check-in counter',
      'Lounge access',
      'Gourmet dining with wine',
      'Two pieces of baggage (32kg each)',
      'Priority everything',
    ],
    priceMultiplier: 2.8,
  },
];
```

- [ ] **Step 5: Create users mock data**

```tsx
// frontend/src/mocks/users.ts
export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'nguyenvana@email.com',
    password: 'password123',
    name: 'Nguyen Van An',
    phone: '0912345678',
    role: 'customer',
    tier: 'Gold',
  },
  {
    id: 'user-2',
    email: 'admin@skywing.vn',
    password: 'admin123',
    name: 'Admin User',
    phone: '0999999999',
    role: 'admin',
  },
  {
    id: 'user-3',
    email: 'test@email.com',
    password: 'test123',
    name: 'Test User',
    phone: '0888888888',
    role: 'customer',
  },
];
```

- [ ] **Step 6: Create bookings mock data**

```tsx
// frontend/src/mocks/bookings.ts
export interface MockBooking {
  id: string;
  bookingRef: string;
  userId: string;
  flight: {
    number: string;
    route: string;
    date: string;
    departure: { time: string; airport: string };
    arrival: { time: string; airport: string };
    cabinClass: string;
  };
  passenger: {
    name: string;
    type: string;
    seat: string;
  };
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalAmount: number;
  createdAt: string;
}

export const mockBookings: MockBooking[] = [
  {
    id: 'book-1',
    bookingRef: 'BK-ABC123',
    userId: 'user-1',
    flight: {
      number: 'VN1234',
      route: 'HAN → SGN',
      date: '2026-06-15',
      departure: { time: '06:00', airport: 'HAN' },
      arrival: { time: '08:30', airport: 'SGN' },
      cabinClass: 'Business',
    },
    passenger: {
      name: 'Nguyen Van An',
      type: 'Adult',
      seat: '12A',
    },
    status: 'confirmed',
    totalAmount: 9688000,
    createdAt: '2026-01-10T10:30:00Z',
  },
  {
    id: 'book-2',
    bookingRef: 'BK-DEF456',
    userId: 'user-1',
    flight: {
      number: 'VN5678',
      route: 'SGN → DAD',
      date: '2026-02-20',
      departure: { time: '14:00', airport: 'SGN' },
      arrival: { time: '16:15', airport: 'DAD' },
      cabinClass: 'Economy',
    },
    passenger: {
      name: 'Nguyen Van An',
      type: 'Adult',
      seat: '24C',
    },
    status: 'completed',
    totalAmount: 2450000,
    createdAt: '2026-01-05T08:15:00Z',
  },
];
```

- [ ] **Step 7: Create passengers mock data**

```tsx
// frontend/src/mocks/passengers.ts
export interface PassengerType {
  id: string;
  label: string;
  ageRange: string;
  count: number;
}

export const passengerTypes: PassengerType[] = [
  { id: 'adult', label: 'Adults', ageRange: '12+ years', count: 1 },
  { id: 'child', label: 'Children', ageRange: '2-11 years', count: 0 },
  { id: 'infant', label: 'Infants', ageRange: 'Under 2 years', count: 0 },
];
```

- [ ] **Step 8: Create mock data index**

```tsx
// frontend/src/mocks/index.ts
export * from './airports';
export * from './flights';
export * from './services';
export * from './fares';
export * from './users';
export * from './bookings';
export * from './passengers';
```

- [ ] **Step 9: Commit**

```bash
git add src/mocks/
git commit -m "feat(frontend): add mock data for development"
```

---

## Task 2: Create AuthContext

**Files:**
- Create: `frontend/src/context/AuthContext.tsx`

**Interfaces:**
- Produces: `AuthContext` with login/logout/register functions
- Consumes: Mock users data

---

### Task 2: Create AuthContext

**Requirements & Acceptance Criteria:**
- [ ] Context provides user state and auth functions
- [ ] Login validates against mock users
- [ ] Logout clears user state
- [ ] Register adds new user to state (localStorage)
- [ ] Protected route component for admin pages

- [ ] **Step 1: Create AuthContext**

```tsx
// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers, type MockUser } from '@/mocks/users';

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'skywing_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if email already exists
    const exists = mockUsers.some((u) => u.email === data.email);
    if (exists) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      role: 'customer',
    };

    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/AuthContext.tsx
git commit -m "feat(frontend): add AuthContext with login/register/logout"
```

---

## Task 3: Create BookingContext

**Files:**
- Create: `frontend/src/context/BookingContext.tsx`

**Interfaces:**
- Produces: `BookingContext` with state and dispatch
- Consumes: Type definitions from feature components

---

### Task 3: Create BookingContext

**Requirements & Acceptance Criteria:**
- [ ] State includes: searchData, selectedFlight, passengers, services, contact
- [ ] Reducer handles all booking actions
- [ ] Price calculation helper
- [ ] Reset booking function

- [ ] **Step 1: Create BookingContext**

```tsx
// frontend/src/context/BookingContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { SearchFormData } from '@/components/features/SearchConsole/SearchConsole';
import type { FlightData } from '@/components/features/FlightCard/FlightCard';
import type { ServiceData } from '@/components/features/ServiceCard/ServiceCard';

// Types
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

interface BookingState {
  searchData: SearchFormData | null;
  selectedFlight: FlightData | null;
  passengers: PassengerInfo[];
  selectedServices: ServiceData[];
  contactInfo: ContactInfo | null;
}

type BookingAction =
  | { type: 'SET_SEARCH'; payload: SearchFormData }
  | { type: 'SELECT_FLIGHT'; payload: FlightData }
  | { type: 'ADD_PASSENGER'; payload: PassengerInfo }
  | { type: 'UPDATE_PASSENGER'; payload: { id: string; data: Partial<PassengerInfo> } }
  | { type: 'REMOVE_PASSENGER'; payload: string }
  | { type: 'ADD_SERVICE'; payload: ServiceData }
  | { type: 'REMOVE_SERVICE'; payload: string }
  | { type: 'SET_CONTACT'; payload: ContactInfo }
  | { type: 'RESET' };

const initialState: BookingState = {
  searchData: null,
  selectedFlight: null,
  passengers: [],
  selectedServices: [],
  contactInfo: null,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
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
      return initialState;
    default:
      return state;
  }
}

// Context
interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  totalPassengers: number;
  totalServicesPrice: number;
  grandTotal: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const totalPassengers =
    state.searchData?.passengers.adults +
    state.searchData?.passengers.children +
    state.searchData?.passengers.infants || 0;

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
```

- [ ] **Step 2: Commit**

```bash
git add src/context/BookingContext.tsx
git commit -m "feat(frontend): add BookingContext with reducer"
```

---

## Task 4: Create Layouts

**Files:**
- Create: `frontend/src/layouts/AuthLayout.tsx`
- Create: `frontend/src/layouts/MainLayout.tsx`
- Create: `frontend/src/layouts/BookingLayout.tsx`
- Create: `frontend/src/layouts/AdminLayout.tsx`
- Create: `frontend/src/layouts/index.ts`

**Interfaces:**
- Consumes: Phase 2/3 components
- Produces: Layout wrapper components

---

### Task 4: Create Layouts

**Requirements & Acceptance Criteria:**
- [ ] AuthLayout: Centered card with logo, no header
- [ ] MainLayout: Header + main content + footer
- [ ] BookingLayout: Header + ProgressStepper + content + sticky summary
- [ ] AdminLayout: Sidebar navigation + header + content

- [ ] **Step 1: Create AuthLayout**

```tsx
// frontend/src/layouts/AuthLayout.tsx
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              alt="SkyWing Airlines Logo"
              className="h-10 w-auto"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WKXmyLxsjYeUagEpINwoQY5yURNIbgoeTktKUVR0C6q5Om0a0Wz77anAgM8RFUdnLmZI-oU2n0nPaj1YOT-9uh4TEApLyrhX9Oon8nB8c60CwONqGLaFQkezF8stU4h-mKlTo8jXBW--1cYxKiQOlUzNWSG8pf7phg0ZDOks-t2EaXpqcPKTGa3LOp-n-Jm7voubEn0Q2k3ghQDOUQ9chb5AtwEenP5j1IoUpFnWvf4-Uk8zFgFoIdEA"
            />
            <span className="font-headline-sm text-primary text-xl">SkyWing</span>
          </Link>
        </div>

        {/* Content */}
        {children}

        {/* Footer Links */}
        <div className="mt-6 text-center text-body-sm text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">
            Back to Home
          </Link>
          <span className="mx-2">·</span>
          <span>© 2026 SkyWing Airlines</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MainLayout**

```tsx
// frontend/src/layouts/MainLayout.tsx
import React, { ReactNode } from 'react';
import { Header } from '@/components/features/Header/Header';
import { useAuth } from '@/context/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header 
        user={user ? { name: user.name, tier: user.tier } : undefined}
      />
      
      <main className="flex-1 pt-16">
        {children}
      </main>

      {showFooter && (
        <footer className="bg-surface-container-low py-8 mt-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img
                  alt="SkyWing Logo"
                  className="h-6 w-auto"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WKXmyLxsjYeUagEpINwoQY5yURNIbgoeTktKUVR0C6q5Om0a0Wz77anAgM8RFUdnLmZI-oU2n0nPaj1YOT-9uh4TEApLyrhX9Oon8nB8c60CwONqGLaFQkezF8stU4h-mKlTo8jXBW--1cYxKiQOlUzNWSG8pf7phg0ZDOks-t2EaXpqcPKTGa3LOp-n-Jm7voubEn0Q2k3ghQDOUQ9chb5AtwEenP5j1IoUpFnWvf4-Uk8zFgFoIdEA"
                />
                <span className="font-label-md text-on-surface-variant">
                  © 2026 SkyWing Airlines. All rights reserved.
                </span>
              </div>
              <div className="flex gap-6 text-body-sm text-on-surface-variant">
                <a href="#" className="hover:text-primary">Privacy Policy</a>
                <a href="#" className="hover:text-primary">Terms of Service</a>
                <a href="#" className="hover:text-primary">Contact Us</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create BookingLayout**

```tsx
// frontend/src/layouts/BookingLayout.tsx
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/features/Header/Header';
import { ProgressStepper } from '@/components/features/ProgressStepper/ProgressStepper';
import { BookingSummary } from '@/components/features/BookingSummary/BookingSummary';
import { Button } from '@/components/ui/Button/Button';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';

interface BookingLayoutProps {
  children: ReactNode;
  currentStep: number;
}

const bookingSteps = [
  { id: 'flight', label: 'Select Flight', href: '/flights' },
  { id: 'passenger', label: 'Passenger Info', href: '/passenger' },
  { id: 'services', label: 'Add-ons', href: '/services' },
  { id: 'payment', label: 'Payment', href: '/payment' },
];

export function BookingLayout({ children, currentStep }: BookingLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, grandTotal, totalPassengers } = useBooking();

  // Build summary items
  const summaryItems = [
    ...(state.selectedFlight
      ? [{ label: `${state.selectedFlight.flightNumber} × ${totalPassengers}`, value: state.selectedFlight.price * totalPassengers, type: 'base' as const }]
      : []),
    ...state.selectedServices.map((s) => ({
      label: s.name,
      value: s.price,
      type: 'addon' as const,
    })),
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header user={user ? { name: user.name, tier: user.tier } : undefined} />

      <main className="flex-1 pt-16">
        {/* Progress Stepper */}
        <div className="bg-surface-container-low py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <ProgressStepper
              steps={bookingSteps}
              currentStep={currentStep}
              onStepClick={(step) => {
                if (step < currentStep) {
                  navigate(bookingSteps[step].href);
                }
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {children}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <BookingSummary
                  items={summaryItems}
                  grandTotal={grandTotal}
                />

                {/* Navigation Buttons */}
                <div className="mt-4 flex gap-3">
                  {currentStep > 0 && (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => navigate(bookingSteps[currentStep - 1].href)}
                    >
                      Back
                    </Button>
                  )}
                  {currentStep < 3 && (
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => navigate(bookingSteps[currentStep + 1].href)}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create AdminLayout**

```tsx
// frontend/src/layouts/AdminLayout.tsx
import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon/Icon';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' as const, path: '/admin' },
  { id: 'flights', label: 'Flights', icon: 'flight' as const, path: '/admin/flights' },
  { id: 'services', label: 'Services', icon: 'miscellaneous_services' as const, path: '/admin/services' },
  { id: 'fares', label: 'Fares', icon: 'sell' as const, path: '/admin/fares' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-outline-variant">
          <Link to="/" className="flex items-center gap-2">
            <img
              alt="SkyWing Logo"
              className="h-8 w-auto"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WKXmyLxsjYeUagEpINwoQY5yURNIbgoeTktKUVR0C6q5Om0a0Wz77anAgM8RFUdnLmZI-oU2n0nPaj1YOT-9uh4TEApLyrhX9Oon8nB8c60CwONqGLaFQkezF8stU4h-mKlTo8jXBW--1cYxKiQOlUzNWSG8pf7phg0ZDOks-t2EaXpqcPKTGa3LOp-n-Jm7voubEn0Q2k3ghQDOUQ9chb5AtwEenP5j1IoUpFnWvf4-Uk8zFgFoIdEA"
            />
            <span className="font-headline-sm text-primary">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-label-lg transition-colors
                  ${isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }
                `}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="font-label-lg text-on-primary-container">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-lg text-on-surface truncate">{user?.name}</p>
              <p className="font-body-sm text-on-surface-variant truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant px-6 flex items-center justify-between">
          <h1 className="font-headline-sm text-headline-sm text-primary">
            SkyWing Admin Panel
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create layouts index**

```tsx
// frontend/src/layouts/index.ts
export { AuthLayout } from './AuthLayout';
export { MainLayout } from './MainLayout';
export { BookingLayout } from './BookingLayout';
export { AdminLayout } from './AdminLayout';
```

- [ ] **Step 6: Commit**

```bash
git add src/layouts/
git commit -m "feat(frontend): add all layout components"
```

---

## Task 5: Create Auth Pages

**Files:**
- Create: `frontend/src/pages/auth/LoginPage.tsx`
- Create: `frontend/src/pages/auth/RegisterPage.tsx`

**Interfaces:**
- Consumes: AuthContext, AuthLayout
- Produces: Login/Register page components

---

### Task 5: Create Auth Pages

**Requirements & Acceptance Criteria:**
- [ ] Login page with email/password form
- [ ] Register page with name/email/password/phone form
- [ ] Form validation
- [ ] Error handling
- [ ] Redirect on success

- [ ] **Step 1: Create LoginPage**

```tsx
// frontend/src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { Card } from '@/components/ui/Card/Card';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <Card variant="elevated" padding="lg">
        <h1 className="font-headline-lg text-headline-lg text-primary text-center mb-2">
          Welcome Back
        </h1>
        <p className="font-body-md text-on-surface-variant text-center mb-6">
          Sign in to continue to SkyWing Airlines
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-sm">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={setRememberMe}
            />
            <Link
              to="/forgot-password"
              className="font-body-sm text-secondary hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center font-body-md text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/register" className="text-secondary hover:text-primary font-semibold">
            Sign up
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
```

- [ ] **Step 2: Create RegisterPage**

```tsx
// frontend/src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { useAuth } from '@/context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }

    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <Card variant="elevated" padding="lg">
        <h1 className="font-headline-lg text-headline-lg text-primary text-center mb-2">
          Create Account
        </h1>
        <p className="font-body-md text-on-surface-variant text-center mb-6">
          Join SkyWing Airlines and start your journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-sm">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="Nguyen Van A"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            placeholder="0912345678"
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            placeholder="Min. 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            placeholder="Confirm your password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center font-body-md text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary hover:text-primary font-semibold">
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/auth/
git commit -m "feat(frontend): add Login and Register pages"
```

---

## Task 6: Create User Booking Pages

**Files:**
- Create: `frontend/src/pages/booking/DashboardPage.tsx`
- Create: `frontend/src/pages/booking/FlightResultsPage.tsx`
- Create: `frontend/src/pages/booking/PassengerInfoPage.tsx`
- Create: `frontend/src/pages/booking/ServicesPage.tsx`
- Create: `frontend/src/pages/booking/PaymentPage.tsx`
- Create: `frontend/src/pages/booking/ConfirmationPage.tsx`

**Interfaces:**
- Consumes: Layouts, Feature Components, Contexts, Mock Data

---

### Task 6: Create User Booking Pages

**Requirements & Acceptance Criteria:**
- [ ] Dashboard: Hero section + SearchConsole
- [ ] FlightResults: Filter + FlightCard list
- [ ] PassengerInfo: Passenger form for each passenger
- [ ] ServicesPage: ServiceCard grid + selection
- [ ] PaymentPage: Payment form
- [ ] ConfirmationPage: Success + ETicket

- [ ] **Step 1: Create DashboardPage**

```tsx
// frontend/src/pages/booking/DashboardPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { SearchConsole, type SearchFormData } from '@/components/features/SearchConsole/SearchConsole';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { airports } from '@/mocks/airports';
import { useBooking } from '@/context/BookingContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { dispatch } = useBooking();

  const handleSearch = (data: SearchFormData) => {
    dispatch({ type: 'SET_SEARCH', payload: data });
    navigate('/flights');
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative w-full bg-surface-container-low pt-12 pb-24 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-secondary-fixed/40 blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-4">
            <Icon name="flight_takeoff" size={16} />
            SKYWING A350 & BOEING 787 FLEET DEPLOYED
          </Badge>

          <h1 className="font-display-hero text-display-hero text-primary tracking-tight font-bold mb-4">
            Search and Book Flights Across Classes
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mb-8">
            Experience seamless journeys with premium comfort, transparent fares, and precision scheduled departures.
          </p>
        </div>
      </section>

      {/* Search Console */}
      <section className="relative max-w-6xl w-full mx-auto px-6 -mt-16 z-20">
        <SearchConsole
          airports={airports}
          onSearch={handleSearch}
        />
      </section>

      {/* Status Ribbon */}
      <section className="max-w-6xl w-full mx-auto px-6 mt-8">
        <div className="bg-surface-container-high/40 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-md text-primary font-semibold uppercase tracking-wider">
              Operational Dispatch
            </span>
            <span className="font-body-sm text-on-surface-variant">
              All flight corridors operating on normal seasonal timetable.
            </span>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
```

- [ ] **Step 2: Create FlightResultsPage**

```tsx
// frontend/src/pages/booking/FlightResultsPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingLayout } from '@/layouts/BookingLayout';
import { FlightCard } from '@/components/features/FlightCard/FlightCard';
import { Badge } from '@/components/ui/Badge/Badge';
import { Chip } from '@/components/ui/Chip/Chip';
import { flights as mockFlights } from '@/mocks/flights';
import { useBooking } from '@/context/BookingContext';
import type { FlightData } from '@/components/features/FlightCard/FlightCard';

export function FlightResultsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useBooking();
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'high'>('all');

  const filteredFlights = mockFlights.filter((f) => {
    if (priceFilter === 'low') return f.price < 3500000;
    if (priceFilter === 'high') return f.price >= 3500000;
    return true;
  });

  const handleSelectFlight = (flight: FlightData) => {
    setSelectedFlight(flight);
    dispatch({ type: 'SELECT_FLIGHT', payload: flight });
  };

  const handleContinue = () => {
    if (selectedFlight) {
      navigate('/passenger');
    }
  };

  return (
    <BookingLayout currentStep={0}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Select Your Flight
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            {state.searchData?.origin?.code} → {state.searchData?.destination?.code} ·{' '}
            {state.searchData?.departureDate?.toLocaleDateString()}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Chip
            selected={priceFilter === 'all'}
            onClick={() => setPriceFilter('all')}
          >
            All Prices
          </Chip>
          <Chip
            selected={priceFilter === 'low'}
            onClick={() => setPriceFilter('low')}
          >
            Under 3.5M
          </Chip>
          <Chip
            selected={priceFilter === 'high'}
            onClick={() => setPriceFilter('high')}
          >
            3.5M+
          </Chip>
        </div>

        {/* Flight List */}
        <div className="space-y-4">
          {filteredFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onSelect={handleSelectFlight}
              selected={selectedFlight?.id === flight.id}
            />
          ))}
        </div>

        {/* Continue Button */}
        {selectedFlight && (
          <div className="fixed bottom-24 right-6">
            <button
              onClick={handleContinue}
              className="bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg px-8 py-4 rounded-lg shadow-lg flex items-center gap-2"
            >
              Continue to Passenger Info
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </BookingLayout>
  );
}
```

- [ ] **Step 3: Create PassengerInfoPage**

```tsx
// frontend/src/pages/booking/PassengerInfoPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingLayout } from '@/layouts/BookingLayout';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { useBooking } from '@/context/BookingContext';

const titleOptions = [
  { value: 'Mr', label: 'Mr.' },
  { value: 'Ms', label: 'Ms.' },
  { value: 'Mrs', label: 'Mrs.' },
];

export function PassengerInfoPage() {
  const navigate = useNavigate();
  const { state, dispatch, totalPassengers } = useBooking();
  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: 'Vietnam (VNM)',
  });

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddPassenger = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return; // Validation
    }

    dispatch({
      type: 'ADD_PASSENGER',
      payload: {
        id: `passenger-${Date.now()}`,
        type: 'adult',
        ...formData,
      },
    });

    if (currentPassenger < totalPassengers - 1) {
      setCurrentPassenger((prev) => prev + 1);
      setFormData({
        title: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationality: 'Vietnam (VNM)',
      });
    } else {
      navigate('/services');
    }
  };

  return (
    <BookingLayout currentStep={1}>
      <div className="space-y-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Passenger Information
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Enter details for all passengers. Names must match official ID.
          </p>
        </div>

        <Badge variant="secondary">
          Passenger {currentPassenger + 1} of {totalPassengers}
        </Badge>

        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Title"
                options={titleOptions}
                value={formData.title}
                onChange={(v) => setFormData((prev) => ({ ...prev, title: v }))}
              />
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                placeholder="NGUYEN"
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                placeholder="VAN A"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="email@example.com"
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="0912345678"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                required
              />
              <Input
                label="Nationality"
                value={formData.nationality}
                onChange={handleInputChange('nationality')}
                placeholder="Vietnam"
                required
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleAddPassenger}
            >
              {currentPassenger < totalPassengers - 1
                ? 'Add Passenger & Continue'
                : 'Continue to Services'}
            </Button>
          </div>
        </Card>
      </div>
    </BookingLayout>
  );
}
```

- [ ] **Step 4: Create ServicesPage**

```tsx
// frontend/src/pages/booking/ServicesPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingLayout } from '@/layouts/BookingLayout';
import { ServiceCard } from '@/components/features/ServiceCard/ServiceCard';
import { services as mockServices } from '@/mocks/services';
import { useBooking } from '@/context/BookingContext';

export function ServicesPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useBooking();

  const toggleService = (service: typeof mockServices[0]) => {
    const isSelected = state.selectedServices.some((s) => s.id === service.id);
    if (isSelected) {
      dispatch({ type: 'REMOVE_SERVICE', payload: service.id });
    } else {
      dispatch({ type: 'ADD_SERVICE', payload: service });
    }
  };

  return (
    <BookingLayout currentStep={2}>
      <div className="space-y-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Customize Your Trip
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Enhance your journey with extra services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={state.selectedServices.some((s) => s.id === service.id)}
              onToggle={() => toggleService(service)}
            />
          ))}
        </div>

        <div className="pt-6 border-t border-outline-variant flex justify-end">
          <button
            onClick={() => navigate('/payment')}
            className="bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg px-8 py-3 rounded-lg"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </BookingLayout>
  );
}
```

- [ ] **Step 5: Create PaymentPage**

```tsx
// frontend/src/pages/booking/PaymentPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingLayout } from '@/layouts/BookingLayout';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';
import { useBooking } from '@/context/BookingContext';

export function PaymentPage() {
  const navigate = useNavigate();
  const { grandTotal } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    navigate('/confirmation');
  };

  return (
    <BookingLayout currentStep={3}>
      <div className="space-y-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Payment Details
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Complete your booking with secure payment
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg flex items-center gap-3">
              <Icon name="lock" size={20} className="text-secondary" />
              <span className="font-body-sm text-on-surface-variant">
                256-bit SSL Encrypted Payment
              </span>
            </div>

            <Input
              label="Card Number"
              value={formData.cardNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, cardNumber: e.target.value }))}
              placeholder="1234 5678 9012 3456"
              required
            />

            <Input
              label="Card Holder Name"
              value={formData.cardHolder}
              onChange={(e) => setFormData((prev) => ({ ...prev, cardHolder: e.target.value }))}
              placeholder="NGUYEN VAN A"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                value={formData.expiry}
                onChange={(e) => setFormData((prev) => ({ ...prev, expiry: e.target.value }))}
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVV"
                type="password"
                value={formData.cvv}
                onChange={(e) => setFormData((prev) => ({ ...prev, cvv: e.target.value }))}
                placeholder="123"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isProcessing}
            >
              Pay {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(grandTotal)}
            </Button>
          </form>
        </Card>
      </div>
    </BookingLayout>
  );
}
```

- [ ] **Step 6: Create ConfirmationPage**

```tsx
// frontend/src/pages/booking/ConfirmationPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ETicket } from '@/components/features/ETicket/ETicket';
import { Button } from '@/components/ui/Button/Button';
import { useBooking } from '@/context/BookingContext';

export function ConfirmationPage() {
  const { state, dispatch } = useBooking();

  const ticket = {
    bookingRef: 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    ticketNumber: 'TKT' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    flight: state.selectedFlight
      ? {
          number: state.selectedFlight.flightNumber,
          airline: state.selectedFlight.airline,
          aircraft: state.selectedFlight.aircraft,
          departure: {
            airport: state.selectedFlight.departure.airport,
            city: 'Hanoi',
            time: state.selectedFlight.departure.time,
            date: state.selectedFlight.departure.date,
            terminal: '1',
          },
          arrival: {
            airport: state.selectedFlight.arrival.airport,
            city: 'Ho Chi Minh City',
            time: state.selectedFlight.arrival.time,
            terminal: '2',
          },
          duration: state.selectedFlight.duration,
          cabinClass: 'Business',
        }
      : {
          number: 'VN1234',
          airline: 'SkyWing Airlines',
          aircraft: 'Boeing 787-9 Dreamliner',
          departure: { airport: 'HAN', city: 'Hanoi', time: '06:00', date: '2026-06-15', terminal: '1' },
          arrival: { airport: 'SGN', city: 'Ho Chi Minh City', time: '08:30', terminal: '2' },
          duration: '2h 30m',
          cabinClass: 'Economy',
        },
    passenger: state.passengers[0]
      ? {
          name: `${state.passengers[0].firstName} ${state.passengers[0].lastName}`,
          type: 'Adult',
          seat: '12A',
        }
      : {
          name: 'Nguyen Van An',
          type: 'Adult',
          seat: '12A',
        },
  };

  const handleNewBooking = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        <ETicket ticket={ticket} />

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="secondary" leftIcon="print" onClick={() => window.print()}>
            Print Ticket
          </Button>
          <Link to="/bookings">
            <Button variant="primary">
              View My Bookings
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" onClick={handleNewBooking}>
              Book Another Flight
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/booking/
git commit -m "feat(frontend): add booking flow pages"
```

---

## Task 7: Create User Pages (Non-Booking)

**Files:**
- Create: `frontend/src/pages/user/MyBookingsPage.tsx`
- Create: `frontend/src/pages/user/BookingDetailsPage.tsx`
- Create: `frontend/src/pages/user/CheckInPage.tsx`
- Create: `frontend/src/pages/user/FlightStatusPage.tsx`

---

### Task 7: Create User Pages

**Requirements & Acceptance Criteria:**
- [ ] MyBookingsPage: List of user's bookings
- [ ] BookingDetailsPage: Single booking detail view
- [ ] CheckInPage: Online check-in form
- [ ] FlightStatusPage: Flight status lookup

- [ ] **Step 1: Create MyBookingsPage**

```tsx
// frontend/src/pages/user/MyBookingsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';
import { mockBookings } from '@/mocks/bookings';
import { useAuth } from '@/context/AuthContext';

export function MyBookingsPage() {
  const { user } = useAuth();
  const userBookings = mockBookings.filter((b) => b.userId === user?.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-8">
          My Bookings
        </h1>

        {userBookings.length === 0 ? (
          <Card variant="elevated" padding="lg" className="text-center">
            <Icon name="flight" size={48} className="text-outline mx-auto mb-4" />
            <h2 className="font-headline-sm text-on-surface mb-2">
              No bookings yet
            </h2>
            <p className="font-body-md text-on-surface-variant mb-4">
              Start planning your next adventure
            </p>
            <Link to="/">
              <Button variant="primary">Search Flights</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {userBookings.map((booking) => (
              <Link key={booking.id} to={`/bookings/${booking.id}`}>
                <Card variant="elevated" padding="md" hoverable className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                      <Icon name="flight" size={24} className="text-secondary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-headline-sm text-primary font-semibold">
                          {booking.flight.number}
                        </span>
                        <Badge
                          variant={
                            booking.status === 'confirmed' ? 'success' :
                            booking.status === 'completed' ? 'primary' :
                            booking.status === 'cancelled' ? 'error' : 'neutral'
                          }
                        >
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="font-body-sm text-on-surface-variant">
                        {booking.flight.route} · {formatDate(booking.flight.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline-sm text-primary font-bold">
                      {formatPrice(booking.totalAmount)}
                    </p>
                    <p className="font-label-sm text-on-surface-variant">
                      {booking.bookingRef}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
```

- [ ] **Step 2: Create BookingDetailsPage**

```tsx
// frontend/src/pages/user/BookingDetailsPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ETicket } from '@/components/features/ETicket/ETicket';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';
import { mockBookings } from '@/mocks/bookings';

export function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const booking = mockBookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 text-center">
          <Icon name="error" size={48} className="text-error mx-auto mb-4" />
          <h2 className="font-headline-sm text-on-surface mb-2">Booking not found</h2>
          <Link to="/bookings">
            <Button variant="secondary">Back to My Bookings</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const ticket = {
    bookingRef: booking.bookingRef,
    ticketNumber: 'TKT' + booking.bookingRef.replace('BK-', ''),
    flight: {
      number: booking.flight.number,
      airline: 'SkyWing Airlines',
      aircraft: 'Boeing 787-9 Dreamliner',
      departure: {
        airport: booking.flight.departure.airport,
        city: booking.flight.departure.airport === 'HAN' ? 'Hanoi' : 'Da Nang',
        time: booking.flight.departure.time,
        date: booking.flight.date,
        terminal: '1',
      },
      arrival: {
        airport: booking.flight.arrival.airport,
        city: booking.flight.arrival.airport === 'SGN' ? 'Ho Chi Minh City' : booking.flight.arrival.airport,
        time: booking.flight.arrival.time,
        terminal: '2',
      },
      duration: '2h 30m',
      cabinClass: booking.flight.cabinClass,
    },
    passenger: booking.passenger,
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-6"
        >
          <Icon name="arrow_back" size={18} />
          Back to My Bookings
        </Link>

        <ETicket ticket={ticket} />

        <div className="mt-8 flex gap-4">
          <Button variant="secondary" leftIcon="print" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="secondary" leftIcon="download">
            Download PDF
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
```

- [ ] **Step 3: Create CheckInPage**

```tsx
// frontend/src/pages/user/CheckInPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';

export function CheckInPage() {
  const navigate = useNavigate();
  const [bookingRef, setBookingRef] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock validation
    if (bookingRef.toUpperCase() === 'BK-ABC123' && lastName.toUpperCase() === 'AN') {
      navigate('/confirmation');
    } else {
      setError('Booking not found. Please check your booking reference and last name.');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-6 lg:px-12 py-12">
        <div className="text-center mb-8">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
            Online Check-in
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Enter your booking details to check in for your flight
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleCheckIn} className="space-y-4">
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg flex items-center gap-2">
                <Icon name="error" size={20} />
                {error}
              </div>
            )}

            <Input
              label="Booking Reference (PNR)"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="e.g., BK-ABC123"
              required
            />

            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="As shown on ticket"
              required
            />

            <Button type="submit" variant="primary" className="w-full">
              Check In
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center font-body-sm text-on-surface-variant">
          Check-in opens 24 hours before departure and closes 2 hours before departure.
        </p>
      </div>
    </MainLayout>
  );
}
```

- [ ] **Step 4: Create FlightStatusPage**

```tsx
// frontend/src/pages/user/FlightStatusPage.tsx
import React, { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { flights } from '@/mocks/flights';

export function FlightStatusPage() {
  const [flightNumber, setFlightNumber] = useState('');
  const [status, setStatus] = useState<typeof flights[0] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = flights.find(
      (f) => f.flightNumber.toUpperCase() === flightNumber.toUpperCase()
    );
    setStatus(found || null);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-8">
          Flight Status
        </h1>

        <Card variant="elevated" padding="lg" className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Enter flight number (e.g., VN1234)"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </Card>

        {status && (
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge variant="success" className="mb-2">
                  On Time
                </Badge>
                <h2 className="font-headline-md text-primary">
                  {status.flightNumber}
                </h2>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-on-surface-variant">Aircraft</p>
                <p className="font-body-md text-on-surface">{status.aircraft}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-label-sm text-on-surface-variant">Departure</p>
                <p className="font-headline-md text-primary">{status.departure.time}</p>
                <p className="font-body-sm text-on-surface">{status.departure.airport}</p>
              </div>
              <div>
                <Icon name="arrow_forward" size={24} className="text-secondary mx-auto" />
                <p className="font-body-sm text-on-surface-variant">{status.duration}</p>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant">Arrival</p>
                <p className="font-headline-md text-primary">{status.arrival.time}</p>
                <p className="font-body-sm text-on-surface">{status.arrival.airport}</p>
              </div>
            </div>
          </Card>
        )}

        {!status && flightNumber && (
          <Card variant="elevated" padding="lg" className="text-center">
            <Icon name="search" size={48} className="text-outline mx-auto mb-4" />
            <p className="font-body-md text-on-surface-variant">
              No flight found for "{flightNumber}"
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/user/
git commit -m "feat(frontend): add user pages (bookings, check-in, status)"
```

---

## Task 8: Create Admin Pages

**Files:**
- Create: `frontend/src/pages/admin/AdminDashboardPage.tsx`
- Create: `frontend/src/pages/admin/AdminFlightsPage.tsx`
- Create: `frontend/src/pages/admin/AdminServicesPage.tsx`
- Create: `frontend/src/pages/admin/AdminFaresPage.tsx`

**Interfaces:**
- Consumes: AdminLayout, CRUD operations for services/fares

---

### Task 8: Create Admin Pages

**Requirements & Acceptance Criteria:**
- [ ] AdminDashboard: Stats cards with mock data
- [ ] AdminFlights: Flight list (read-only)
- [ ] AdminServices: Full CRUD for services
- [ ] AdminFares: Full CRUD for fare classes

- [ ] **Step 1: Create AdminDashboardPage**

```tsx
// frontend/src/pages/admin/AdminDashboardPage.tsx
import React from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { flights } from '@/mocks/flights';
import { mockBookings } from '@/mocks/bookings';

export function AdminDashboardPage() {
  const stats = [
    {
      label: 'Total Flights',
      value: flights.length,
      icon: 'flight' as const,
      color: 'text-primary',
    },
    {
      label: 'Active Bookings',
      value: mockBookings.filter((b) => b.status === 'confirmed').length,
      icon: 'book_online' as const,
      color: 'text-secondary',
    },
    {
      label: 'Today's Departures',
      value: 24,
      icon: 'departure_board' as const,
      color: 'text-tertiary',
    },
    {
      label: 'Revenue (VND)',
      value: '125.6M',
      icon: 'payments' as const,
      color: 'text-success',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-headline-lg text-headline-lg text-primary">
          Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-label-sm text-on-surface-variant">{stat.label}</p>
                  <p className={`font-headline-md ${stat.color} font-bold mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                  <Icon name={stat.icon} size={24} className={stat.color} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card variant="elevated" padding="md">
          <h2 className="font-headline-sm text-on-surface mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {mockBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0"
              >
                <div>
                  <p className="font-label-lg text-on-surface">{booking.bookingRef}</p>
                  <p className="font-body-sm text-on-surface-variant">
                    {booking.flight.number} · {booking.passenger.name}
                  </p>
                </div>
                <Badge
                  variant={
                    booking.status === 'confirmed' ? 'success' :
                    booking.status === 'completed' ? 'primary' : 'neutral'
                  }
                >
                  {booking.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
```

- [ ] **Step 2: Create AdminFlightsPage**

```tsx
// frontend/src/pages/admin/AdminFlightsPage.tsx
import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { flights } from '@/mocks/flights';

export function AdminFlightsPage() {
  const [flightsList] = useState(flights);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-headline-lg text-primary">Flights</h1>
          <Badge variant="neutral">{flightsList.length} flights</Badge>
        </div>

        <Card variant="elevated" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Flight</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Route</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Time</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Aircraft</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Price</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Seats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {flightsList.map((flight) => (
                  <tr key={flight.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-label-lg text-primary font-semibold">
                      {flight.flightNumber}
                    </td>
                    <td className="px-4 py-3 font-body-md text-on-surface">
                      {flight.departure.airport} → {flight.arrival.airport}
                    </td>
                    <td className="px-4 py-3 font-body-md text-on-surface">
                      {flight.departure.time} - {flight.arrival.time}
                    </td>
                    <td className="px-4 py-3 font-body-sm text-on-surface-variant">
                      {flight.aircraft}
                    </td>
                    <td className="px-4 py-3 font-body-md text-primary font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(flight.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={flight.seatsAvailable > 20 ? 'success' : 'warning'}>
                        {flight.seatsAvailable}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
```

- [ ] **Step 3: Create AdminServicesPage with Full CRUD**

```tsx
// frontend/src/pages/admin/AdminServicesPage.tsx
import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { services as initialServices, type ServiceData } from '@/components/features/ServiceCard/ServiceCard';

export function AdminServicesPage() {
  const [services, setServices] = useState<ServiceData[]>(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    icon: 'miscellaneous_services' as const,
    category: 'baggage' as const,
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      icon: 'miscellaneous_services',
      category: 'baggage',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceData) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      icon: service.icon,
      category: service.category,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id ? { ...s, ...formData } : s
        )
      );
    } else {
      setServices((prev) => [
        ...prev,
        { id: `svc-${Date.now()}`, ...formData },
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-headline-lg text-primary">Services</h1>
          <Button variant="primary" leftIcon="add" onClick={handleOpenCreate}>
            Add Service
          </Button>
        </div>

        <Card variant="elevated" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Name</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Category</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Price</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-right font-label-sm text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-label-lg text-on-surface">{service.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{service.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-body-md text-primary font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(service.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                      >
                        <Icon name="edit" size={18} className="text-secondary" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                      >
                        <Icon name="delete" size={18} className="text-error" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingService ? 'Edit Service' : 'Add Service'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Service Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Extra Baggage (20kg)"
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Service description"
            />
            <Input
              label="Price (VND)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
```

- [ ] **Step 4: Create AdminFaresPage**

```tsx
// frontend/src/pages/admin/AdminFaresPage.tsx
import React, { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { fareClasses, type FareClass } from '@/mocks/fares';

export function AdminFaresPage() {
  const [fares, setFares] = useState<FareClass[]>(fareClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFare, setEditingFare] = useState<FareClass | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    amenities: [''],
    priceMultiplier: 1,
  });

  const handleOpenCreate = () => {
    setEditingFare(null);
    setFormData({ code: '', name: '', description: '', amenities: [''], priceMultiplier: 1 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fare: FareClass) => {
    setEditingFare(fare);
    setFormData({
      code: fare.code,
      name: fare.name,
      description: fare.description,
      amenities: fare.amenities,
      priceMultiplier: fare.priceMultiplier,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingFare) {
      setFares((prev) =>
        prev.map((f) => (f.id === editingFare.id ? { ...f, ...formData } : f))
      );
    } else {
      setFares((prev) => [
        ...prev,
        { id: `fare-${Date.now()}`, ...formData },
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this fare class?')) {
      setFares((prev) => prev.filter((f) => f.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-headline-lg text-primary">Fare Classes</h1>
          <Button variant="primary" leftIcon="add" onClick={handleOpenCreate}>
            Add Fare
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fares.map((fare) => (
            <Card key={fare.id} variant="elevated" padding="md">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">{fare.code}</Badge>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(fare)}
                    className="p-2 hover:bg-surface-container rounded-lg"
                  >
                    <Icon name="edit" size={18} className="text-secondary" />
                  </button>
                  <button
                    onClick={() => handleDelete(fare.id)}
                    className="p-2 hover:bg-surface-container rounded-lg"
                  >
                    <Icon name="delete" size={18} className="text-error" />
                  </button>
                </div>
              </div>
              <h3 className="font-headline-sm text-primary mb-1">{fare.name}</h3>
              <p className="font-body-sm text-on-surface-variant mb-4">{fare.description}</p>
              <div className="border-t border-outline-variant pt-4">
                <p className="font-label-sm text-on-surface-variant mb-2">Multiplier: {fare.priceMultiplier}x</p>
                <ul className="space-y-1">
                  {fare.amenities.slice(0, 3).map((amenity, i) => (
                    <li key={i} className="flex items-center gap-2 font-body-sm text-on-surface">
                      <Icon name="check" size={14} className="text-success" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingFare ? 'Edit Fare Class' : 'Add Fare Class'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., ECO"
              />
              <Input
                label="Price Multiplier"
                type="number"
                step="0.1"
                value={formData.priceMultiplier}
                onChange={(e) => setFormData((prev) => ({ ...prev, priceMultiplier: Number(e.target.value) }))}
              />
            </div>
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/
git commit -m "feat(frontend): add admin pages with CRUD"
```

---

## Task 9: Update App.tsx with Routing

**Files:**
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Produces: Complete routing configuration

---

### Task 9: Update App.tsx with Routing

**Requirements & Acceptance Criteria:**
- [ ] All routes configured
- [ ] Protected routes for admin
- [ ] Auth routes (login, register)
- [ ] Context providers wrapper

- [ ] **Step 1: Update App.tsx**

```tsx
// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { BookingLayout } from './layouts/BookingLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Booking Pages
import { DashboardPage } from './pages/booking/DashboardPage';
import { FlightResultsPage } from './pages/booking/FlightResultsPage';
import { PassengerInfoPage } from './pages/booking/PassengerInfoPage';
import { ServicesPage } from './pages/booking/ServicesPage';
import { PaymentPage } from './pages/booking/PaymentPage';
import { ConfirmationPage } from './pages/booking/ConfirmationPage';

// User Pages
import { MyBookingsPage } from './pages/user/MyBookingsPage';
import { BookingDetailsPage } from './pages/user/BookingDetailsPage';
import { CheckInPage } from './pages/user/CheckInPage';
import { FlightStatusPage } from './pages/user/FlightStatusPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminFlightsPage } from './pages/admin/AdminFlightsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminFaresPage } from './pages/admin/AdminFaresPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Placeholder Components
function NotFoundPage() {
  return (
    <MainLayout>
      <div className="text-center py-20">
        <h1 className="font-display-hero text-primary mb-4">404</h1>
        <p className="font-body-lg text-on-surface-variant mb-6">Page not found</p>
        <a href="/" className="text-secondary hover:text-primary">
          Go back home
        </a>
      </div>
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Public User Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/check-in" element={<CheckInPage />} />
              <Route path="/status" element={<FlightStatusPage />} />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:id"
                element={
                  <ProtectedRoute>
                    <BookingDetailsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Booking Flow Routes */}
            <Route
              path="/flights"
              element={
                <ProtectedRoute>
                  <FlightResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/passenger"
              element={
                <ProtectedRoute>
                  <PassengerInfoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/confirmation"
              element={
                <ProtectedRoute>
                  <ConfirmationPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/flights"
              element={
                <AdminRoute>
                  <AdminFlightsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <AdminRoute>
                  <AdminServicesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/fares"
              element={
                <AdminRoute>
                  <AdminFaresPage />
                </AdminRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat(frontend): configure routing with protected routes"
```

---

## Self-Review Checklist

- [ ] All 16 pages created
- [ ] All 4 layouts implemented
- [ ] AuthContext with login/register/logout
- [ ] BookingContext with reducer
- [ ] 7 mock data files
- [ ] Routing configured with protected routes
- [ ] Admin routes protected by role

## Summary

**Tasks Completed:** 9
**Files Created:** 100+
**Pages:** 16
**Layouts:** 4
**Contexts:** 2
**Mock Data:** 7 files

**Next Phase:** Phase 5 - API Integration & Backend Connection
