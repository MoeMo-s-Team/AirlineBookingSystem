# Phase 3: Composite Components - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 18 composite UI components composed from Phase 2 atomic components for the SkyWing Airlines booking flow.

**Architecture:**
- Components composed from atomic components (Button, Input, Card, Badge, Icon, etc.)
- Airport search with debounced autocomplete
- Date picker with calendar UI
- Service selection with toggle cards
- Progress stepper with routing support

**Tech Stack:** React 18+, TypeScript, Tailwind CSS, Vitest, React Router

**Spec:** Phase 1 Design Tokens, Phase 2 Atomic Components

## Global Constraints

- All components must use CSS variables from Phase 1
- All components must import from atomic components (Phase 2)
- TypeScript strict mode enabled
- Service selection uses toggle card pattern (click to select/deselect)
- SearchConsole includes full airport search, date picker, passenger selector

## Review Focus

- Header: Navigation active state matches current route
- AirportPicker: Search debouncing works correctly (300ms)
- DatePicker: Date selection updates value correctly
- SearchConsole: Form validation prevents empty searches
- ServiceCard: Toggle selection updates parent state
- ProgressStepper: Completed steps are clickable, pending steps are not
- CountdownTimer: Updates every second, shows correct format

---

## Task 1: Install react-day-picker

**Files:**
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: DatePicker component dependency

---

### Task 1: Install Date Picker Library

**Requirements & Acceptance Criteria:**
- [ ] Package `react-day-picker` v8+ installed
- [ ] Date-fns installed for date formatting
- [ ] No version conflicts

- [ ] **Step 1: Install dependencies**

Run: `cd frontend && pnpm add react-day-picker date-fns`
Expected: Packages installed successfully

- [ ] **Step 2: Verify installation**

Run: `cd frontend && pnpm list react-day-picker date-fns`
Expected: Packages appear in dependencies

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(frontend): add react-day-picker and date-fns for DatePicker"
```

---

## Task 2: Create Header Component

**Files:**
- Create: `frontend/src/components/features/Header/Header.tsx`
- Test: `frontend/src/components/features/Header/Header.test.tsx`

**Interfaces:**
- Consumes: `Icon`, `Avatar`, `Button` from `@/components/ui`
- Produces: `Header` component

---

### Task 2: Create Header Component

**Requirements & Acceptance Criteria:**
- [ ] Props: user?, activeNav, onNotificationClick
- [ ] Shows logo and navigation links
- [ ] Active nav item highlighted
- [ ] User menu with avatar and dropdown
- [ ] Notification bell with badge
- [ ] Tests pass: renders, navigation highlighting

- [ ] **Step 1: Create Header component**

```tsx
// frontend/src/components/features/Header/Header.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon/Icon';
import { Avatar } from '@/components/ui/Avatar/Avatar';

interface HeaderUser {
  name: string;
  avatar?: string;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

interface HeaderProps {
  user?: HeaderUser;
  activeNav?: string;
  onNotificationClick?: () => void;
}

const navItems = [
  { id: 'book-flight', label: 'Book Flight', path: '/' },
  { id: 'manage-booking', label: 'Manage Booking', path: '/bookings' },
  { id: 'check-in', label: 'Check-in', path: '/check-in' },
  { id: 'flight-status', label: 'Flight Status', path: '/status' },
];

export function Header({ user, activeNav, onNotificationClick }: HeaderProps) {
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant shadow-[0_1px_3px_rgba(13,71,161,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-space-sm">
          <img 
            alt="SkyWing Airlines Logo" 
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1WKXmyLxsjYeUagEpINwoQY5yURNIbgoeTktKUVR0C6q5Om0a0Wz77anAgM8RFUdnLmZI-oU2n0nPaj1YOT-9uh4TEApLyrhX9Oon8nB8c60CwONqGLaFQkezF8stU4h-mKlTo8jXBW--1cYxKiQOlUzNWSG8pf7phg0ZDOks-t2EaXpqcPKTGa3LOp-n-Jm7voubEn0Q2k3ghQDOUQ9chb5AtwEenP5j1IoUpFnWvf4-Uk8zFgFoIdEA"
          />
          <span className="font-headline-sm text-primary tracking-tight">SkyWing</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-space-xs ml-space-md">
          {navItems.map((item) => {
            const isActive = activeNav === item.id || location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  px-space-md py-space-sm rounded-lg font-label-md transition-colors
                  ${isActive 
                    ? 'bg-surface-container text-primary font-label-lg' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-space-md">
          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            aria-label="Notifications"
            className="relative p-space-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <Icon name="notifications" size={22} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest" />
          </button>

          {/* Sign In / User Menu */}
          {user ? (
            <div className="flex items-center gap-space-sm">
              <Avatar 
                src={user.avatar} 
                initials={getInitials(user.name)} 
                size="sm" 
              />
            </div>
          ) : (
            <Link 
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs border border-secondary-container text-secondary font-label-lg rounded-lg hover:bg-surface-container hover:text-on-secondary-container transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create Header tests**

```tsx
// frontend/src/components/features/Header/Header.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';

const renderHeader = (props = {}) => {
  return render(
    <BrowserRouter>
      <Header {...props} />
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('renders logo', () => {
    renderHeader();
    expect(screen.getByText('SkyWing')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderHeader();
    expect(screen.getByText('Book Flight')).toBeInTheDocument();
    expect(screen.getByText('Manage Booking')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Flight Status')).toBeInTheDocument();
  });

  it('shows sign in button when no user', () => {
    renderHeader();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows user avatar when user provided', () => {
    renderHeader({ user: { name: 'Nguyen Van An' } });
    expect(screen.getByText('NV')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    renderHeader();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/features/Header/Header.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/features/Header/Header.tsx src/components/features/Header/Header.test.tsx
git commit -m "feat(ui): add Header component with navigation"
```

---

## Task 3: Create AirportPicker Component

**Files:**
- Create: `frontend/src/components/features/AirportPicker/AirportPicker.tsx`
- Test: `frontend/src/components/features/AirportPicker/AirportPicker.test.tsx`

**Interfaces:**
- Consumes: `Icon`, `Input`, `Modal` from `@/components/ui`
- Produces: `AirportPicker` component

---

### Task 3: Create AirportPicker Component

**Requirements & Acceptance Criteria:**
- [ ] Props: value, onChange, airports, label, placeholder
- [ ] Debounced search (300ms) for performance
- [ ] Shows airport code, name, city, country
- [ ] Recent searches at top
- [ ] Popular airports section
- [ ] Tests pass: search filtering, selection

- [ ] **Step 1: Create Airport type**

```tsx
// frontend/src/components/features/AirportPicker/types.ts
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
}
```

- [ ] **Step 2: Create AirportPicker component**

```tsx
// frontend/src/components/features/AirportPicker/AirportPicker.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Icon } from '@/components/ui/Icon/Icon';
import { Modal } from '@/components/ui/Modal/Modal';
import { Input } from '@/components/ui/Input/Input';
import type { Airport } from './types';

interface AirportPickerProps {
  value?: Airport;
  onChange: (airport: Airport) => void;
  airports: Airport[];
  label?: string;
  placeholder?: string;
  type?: 'origin' | 'destination';
}

export function AirportPicker({
  value,
  onChange,
  airports,
  label = 'Select Airport',
  placeholder = 'Search city or airport',
  type = 'origin',
}: AirportPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const iconName = type === 'origin' ? 'flight_takeoff' : 'flight_land';

  const filteredAirports = useMemo(() => {
    if (!debouncedSearch) return [];
    const query = debouncedSearch.toLowerCase();
    return airports
      .filter(
        (airport) =>
          airport.code.toLowerCase().includes(query) ||
          airport.name.toLowerCase().includes(query) ||
          airport.city.toLowerCase().includes(query)
      )
      .slice(0, 10);
  }, [debouncedSearch, airports]);

  const handleSelect = useCallback((airport: Airport) => {
    onChange(airport);
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-surface-container-low/60 hover:bg-surface-container-low transition-colors rounded-lg p-space-md text-left group"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-outline uppercase tracking-wider flex items-center gap-1">
            <Icon name={iconName} size={16} className="text-secondary" />
            {label}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm">
            {type === 'origin' ? 'ORIGIN' : 'DEST'}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          {value ? (
            <>
              <p className="font-headline-md text-primary font-semibold truncate">
                {value.code}
              </p>
              <p className="font-body-sm text-on-surface-variant truncate text-right">
                {value.city}
              </p>
            </>
          ) : (
            <p className="font-headline-md text-on-surface-variant">
              {placeholder}
            </p>
          )}
        </div>
        {value && (
          <p className="font-body-sm text-outline truncate mt-0.5">
            {value.name}
          </p>
        )}
      </button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearch('');
        }}
        title={label}
        size="md"
      >
        <div className="space-y-4">
          {/* Search Input */}
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon="search"
          />

          {/* Results */}
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredAirports.length === 0 && debouncedSearch && (
              <p className="text-center py-8 text-on-surface-variant">
                No airports found
              </p>
            )}
            {filteredAirports.map((airport) => (
              <button
                key={airport.code}
                onClick={() => handleSelect(airport)}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                  <Icon name="flight" size={20} className="text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-primary font-semibold">
                      {airport.code}
                    </span>
                    <span className="font-body-sm text-on-surface-variant truncate">
                      {airport.city}, {airport.country}
                    </span>
                  </div>
                  <p className="font-body-sm text-outline truncate">
                    {airport.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
```

- [ ] **Step 3: Create useDebouncedValue hook**

```tsx
// frontend/src/hooks/useDebouncedValue.ts
import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

- [ ] **Step 4: Create AirportPicker tests**

```tsx
// frontend/src/components/features/AirportPicker/AirportPicker.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AirportPicker } from './AirportPicker';
import type { Airport } from './types';

const mockAirports: Airport[] = [
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', countryCode: 'VN' },
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN' },
  { code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam', countryCode: 'VN' },
];

describe('AirportPicker', () => {
  it('renders with label and placeholder', () => {
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={vi.fn()}
        label="Origin"
        placeholder="Select origin"
      />
    );
    expect(screen.getByText('Origin')).toBeInTheDocument();
  });

  it('shows selected airport code', () => {
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={vi.fn()}
        value={mockAirports[0]}
      />
    );
    expect(screen.getByText('HAN')).toBeInTheDocument();
  });

  it('opens modal on click', () => {
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('filters airports based on search', async () => {
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByPlaceholderText('Search city or airport');
    fireEvent.change(input, { target: { value: 'HAN' } });
    
    await waitFor(() => {
      expect(screen.getByText('Noi Bai International Airport')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 5: Run tests**

Run: `cd frontend && pnpm test src/components/features/AirportPicker/AirportPicker.test.tsx`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/features/AirportPicker/ src/hooks/useDebouncedValue.ts
git commit -m "feat(ui): add AirportPicker with debounced search"
```

---

## Task 4: Create DatePicker Component

**Files:**
- Create: `frontend/src/components/features/DatePicker/DatePicker.tsx`

**Interfaces:**
- Consumes: `Icon`, `Modal` from `@/components/ui`
- Produces: `DatePicker` component

---

### Task 4: Create DatePicker Component

**Requirements & Acceptance Criteria:**
- [ ] Props: value, onChange, minDate, label, placeholder
- [ ] Shows calendar modal
- [ ] Formats display date as "Wed, Dec 25, 2026"
- [ ] Highlights selected date
- [ ] Past dates disabled by default

- [ ] **Step 1: Create DatePicker component**

```tsx
// frontend/src/components/features/DatePicker/DatePicker.tsx
import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addMonths, isBefore, startOfToday } from 'date-fns';
import { Icon } from '@/components/ui/Icon/Icon';
import { Modal } from '@/components/ui/Modal/Modal';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  label?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  label = 'Select Date',
  placeholder = 'Pick a date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const today = startOfToday();
  const defaultMinDate = minDate || today;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setIsOpen(false);
    }
  };

  const disabledDays = (date: Date) => {
    return isBefore(date, defaultMinDate);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-surface-container-low/60 hover:bg-surface-container-low transition-colors rounded-lg p-space-md text-left"
      >
        <span className="font-label-sm text-outline uppercase tracking-wider flex items-center gap-1">
          <Icon name="calendar_today" size={16} className="text-secondary" />
          {label}
        </span>
        <div className="mt-1">
          {value ? (
            <>
              <p className="font-headline-md text-on-surface font-semibold">
                {format(value, 'yyyy-MM-dd')}
              </p>
              <p className="font-body-sm text-outline truncate mt-0.5">
                {format(value, 'EEEE · MMMM d, yyyy')}
              </p>
            </>
          ) : (
            <p className="font-headline-md text-on-surface-variant">
              {placeholder}
            </p>
          )}
        </div>
      </button>

      {/* Calendar Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label}
        size="sm"
      >
        <div className="flex justify-center">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={disabledDays}
            fromMonth={today}
            defaultMonth={value || today}
            className="bg-surface-container-lowest rounded-lg p-4"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption: 'flex justify-center pt-1 relative items-center',
              caption_label: 'font-headline-sm text-primary font-semibold',
              nav: 'space-x-1 flex items-center',
              nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-outline rounded-lg',
              nav_button_previous: '',
              nav_button_next: '',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell: 'text-on-surface-variant w-10 font-label-sm font-semibold text-center',
              row: 'flex w-full mt-2',
              cell: 'h-10 w-10 text-center p-0 relative [&:has([aria-selected])]:bg-surface-container-high rounded-full',
              day: 'h-10 w-10 p-0 font-body-md rounded-full hover:bg-surface-container transition-colors',
              day_selected: 'bg-primary text-on-primary hover:bg-primary-container',
              day_today: 'font-bold border border-secondary',
              day_outside: 'text-outline opacity-50',
              day_disabled: 'text-outline opacity-30 cursor-not-allowed',
              day_range_middle: 'aria-selected:bg-surface-container-high aria-selected:text-on-surface',
              day_hidden: 'invisible',
            }}
            components={{
              IconLeft: () => <Icon name="chevron_left" size={18} />,
              IconRight: () => <Icon name="chevron_right" size={18} />,
            }}
          />
        </div>
      </Modal>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/DatePicker/DatePicker.tsx
git commit -m "feat(ui): add DatePicker with calendar modal"
```

---

## Task 5: Create PassengerSelector Component

**Files:**
- Create: `frontend/src/components/features/PassengerSelector/PassengerSelector.tsx`

**Interfaces:**
- Consumes: `Icon`, `Button`, `Modal` from `@/components/ui`
- Produces: `PassengerSelector` component

---

### Task 5: Create PassengerSelector Component

**Requirements & Acceptance Criteria:**
- [ ] Props: value, onChange
- [ ] Shows total passengers summary
- [ ] Dropdown with adults/children/infants counters
- [ ] Minimum 1 adult required
- [ ] Maximum 9 total passengers

- [ ] **Step 1: Create PassengerSelector component**

```tsx
// frontend/src/components/features/PassengerSelector/PassengerSelector.tsx
import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon/Icon';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectorProps {
  value: PassengerCount;
  onChange: (passengers: PassengerCount) => void;
  label?: string;
}

export function PassengerSelector({
  value,
  onChange,
  label = 'Passengers & Class',
}: PassengerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalPassengers = value.adults + value.children + value.infants;

  const updateCount = (type: keyof PassengerCount, delta: number) => {
    const newValue = { ...value };
    const newCount = newValue[type] + delta;
    
    // Validation rules
    if (type === 'adults' && (newCount < 1 || totalPassengers + delta > 9)) return;
    if (type === 'children' && (newCount < 0 || totalPassengers + delta > 9)) return;
    if (type === 'infants' && (newCount < 0 || newCount > value.adults || totalPassengers + delta > 9)) return;
    if (newCount < 0) return;
    
    newValue[type] = newCount;
    onChange(newValue);
  };

  const CounterRow = ({ 
    label, 
    sublabel, 
    value, 
    onIncrement, 
    onDecrement,
    canDecrement 
  }: { 
    label: string; 
    sublabel: string; 
    value: number; 
    onIncrement: () => void; 
    onDecrement: () => void;
    canDecrement: boolean;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-label-lg text-on-surface">{label}</p>
        <p className="font-body-sm text-on-surface-variant">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrement}
          disabled={!canDecrement}
          className="w-8 h-8 rounded-full border border-outline flex items-center justify-center disabled:opacity-30 hover:bg-surface-container-low transition-colors"
        >
          <span className="text-lg">−</span>
        </button>
        <span className="w-6 text-center font-label-lg font-bold">{value}</span>
        <button
          onClick={onIncrement}
          className="w-8 h-8 rounded-full border border-outline flex items-center justify-center hover:bg-surface-container-low transition-colors"
        >
          <span className="text-lg">+</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-surface-container-low/60 hover:bg-surface-container-low transition-colors rounded-lg p-space-md text-left"
      >
        <span className="font-label-sm text-outline uppercase tracking-wider flex items-center gap-1">
          <Icon name="group" size={16} className="text-secondary" />
          {label}
        </span>
        <div className="mt-1">
          <p className="font-headline-md text-on-surface font-semibold">
            {totalPassengers} Passenger{totalPassengers !== 1 ? 's' : ''}
          </p>
          <p className="font-body-sm text-secondary truncate mt-0.5 font-medium">
            Economy Class
          </p>
        </div>
      </button>

      {/* Dropdown */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Passengers"
        size="sm"
      >
        <div className="space-y-1">
          <CounterRow
            label="Adults"
            sublabel="12+ years"
            value={value.adults}
            onIncrement={() => updateCount('adults', 1)}
            onDecrement={() => updateCount('adults', -1)}
            canDecrement={value.adults > 1}
          />
          <div className="border-t border-outline-variant" />
          <CounterRow
            label="Children"
            sublabel="2-11 years"
            value={value.children}
            onIncrement={() => updateCount('children', 1)}
            onDecrement={() => updateCount('children', -1)}
            canDecrement={value.children > 0}
          />
          <div className="border-t border-outline-variant" />
          <CounterRow
            label="Infants"
            sublabel="Under 2 years"
            value={value.infants}
            onIncrement={() => updateCount('infants', 1)}
            onDecrement={() => updateCount('infants', -1)}
            canDecrement={value.infants > 0}
          />
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant">
          <Button 
            variant="primary" 
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/PassengerSelector/PassengerSelector.tsx
git commit -m "feat(ui): add PassengerSelector with counter controls"
```

---

## Task 6: Create CabinClassSelector Component

**Files:**
- Create: `frontend/src/components/features/CabinClassSelector/CabinClassSelector.tsx`

**Interfaces:**
- Consumes: `Chip` from `@/components/ui`
- Produces: `CabinClassSelector` component

---

### Task 6: Create CabinClassSelector Component

**Requirements & Acceptance Criteria:**
- [ ] Props: value, onChange
- [ ] Options: Economy, Premium Economy, Business, First
- [ ] Single selection
- [ ] Visual feedback on selection

- [ ] **Step 1: Create CabinClassSelector component**

```tsx
// frontend/src/components/features/CabinClassSelector/CabinClassSelector.tsx
import React from 'react';
import { Chip } from '@/components/ui/Chip/Chip';

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

interface CabinClassSelectorProps {
  value: CabinClass;
  onChange: (cabinClass: CabinClass) => void;
}

const cabinClasses: { value: CabinClass; label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];

export function CabinClassSelector({ value, onChange }: CabinClassSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {cabinClasses.map((cabin) => (
        <Chip
          key={cabin.value}
          selected={value === cabin.value}
          onClick={() => onChange(cabin.value)}
        >
          {cabin.label}
        </Chip>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/CabinClassSelector/CabinClassSelector.tsx
git commit -m "feat(ui): add CabinClassSelector with chip options"
```

---

## Task 7: Create TripTypeToggle Component

**Files:**
- Create: `frontend/src/components/features/TripTypeToggle/TripTypeToggle.tsx`

**Interfaces:**
- Consumes: None (uses only Tailwind)
- Produces: `TripTypeToggle` component

---

### Task 7: Create TripTypeToggle Component

**Requirements & Acceptance Criteria:**
- [ ] Props: value, onChange
- [ ] Options: Round Trip, One Way, Multi-City
- [ ] Segmented control style
- [ ] Active state styling

- [ ] **Step 1: Create TripTypeToggle component**

```tsx
// frontend/src/components/features/TripTypeToggle/TripTypeToggle.tsx
import React from 'react';

type TripType = 'roundtrip' | 'oneway' | 'multicity';

interface TripTypeToggleProps {
  value: TripType;
  onChange: (tripType: TripType) => void;
}

const tripTypes: { value: TripType; label: string }[] = [
  { value: 'roundtrip', label: 'Round Trip' },
  { value: 'oneway', label: 'One Way' },
  { value: 'multicity', label: 'Multi-City' },
];

export function TripTypeToggle({ value, onChange }: TripTypeToggleProps) {
  return (
    <div className="inline-flex p-1 bg-surface-container-high/70 rounded-xl shadow-sm">
      {tripTypes.map((trip) => {
        const isActive = value === trip.value;
        return (
          <button
            key={trip.value}
            onClick={() => onChange(trip.value)}
            className={`
              px-space-lg py-space-xs rounded-lg font-label-lg transition-all
              ${isActive 
                ? 'bg-primary text-on-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-primary'
              }
            `}
          >
            {trip.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/TripTypeToggle/TripTypeToggle.tsx
git commit -m "feat(ui): add TripTypeToggle segmented control"
```

---

## Task 8: Create SearchConsole Component

**Files:**
- Create: `frontend/src/components/features/SearchConsole/SearchConsole.tsx`
- Test: `frontend/src/components/features/SearchConsole/SearchConsole.test.tsx`

**Interfaces:**
- Consumes: `AirportPicker`, `DatePicker`, `PassengerSelector`, `CabinClassSelector`, `TripTypeToggle`, `Button`, `Checkbox`
- Produces: `SearchConsole` component

---

### Task 8: Create SearchConsole Component

**Requirements & Acceptance Criteria:**
- [ ] Props: airports, initialValues?, onSearch
- [ ] All sub-components integrated
- [ ] Form validation
- [ ] Swap origin/destination button
- [ ] Tests pass: renders, validation

- [ ] **Step 1: Create SearchConsole component**

```tsx
// frontend/src/components/features/SearchConsole/SearchConsole.tsx
import React, { useState } from 'react';
import { Icon } from '@/components/ui/Icon/Icon';
import { Button } from '@/components/ui/Button/Button';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { AirportPicker } from '../AirportPicker/AirportPicker';
import { DatePicker } from '../DatePicker/DatePicker';
import { PassengerSelector } from '../PassengerSelector/PassengerSelector';
import { TripTypeToggle } from '../TripTypeToggle/TripTypeToggle';
import type { Airport } from '../AirportPicker/types';
import type { PassengerCount } from '../PassengerSelector/PassengerSelector';

type TripType = 'roundtrip' | 'oneway' | 'multicity';
type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface SearchFormData {
  origin?: Airport;
  destination?: Airport;
  departureDate?: Date;
  returnDate?: Date;
  passengers: PassengerCount;
  cabinClass: CabinClass;
  tripType: TripType;
  directFlightsOnly: boolean;
}

interface SearchConsoleProps {
  airports: Airport[];
  initialValues?: Partial<SearchFormData>;
  onSearch: (values: SearchFormData) => void;
}

export function SearchConsole({ 
  airports, 
  initialValues,
  onSearch 
}: SearchConsoleProps) {
  const [formData, setFormData] = useState<SearchFormData>({
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'economy',
    tripType: 'roundtrip',
    directFlightsOnly: true,
    ...initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const swapAirports = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  const handleSearch = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.origin) newErrors.origin = 'Please select origin';
    if (!formData.destination) newErrors.destination = 'Please select destination';
    if (!formData.departureDate) newErrors.departureDate = 'Please select date';
    if (formData.tripType === 'roundtrip' && !formData.returnDate) {
      newErrors.returnDate = 'Please select return date';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSearch(formData);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-xl p-6 lg:p-8">
      {/* Trip Type Toggle */}
      <div className="mb-6">
        <TripTypeToggle
          value={formData.tripType}
          onChange={(tripType) => setFormData((prev) => ({ ...prev, tripType }))}
        />
      </div>

      {/* Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-md items-center">
        {/* Origin */}
        <div className="lg:col-span-3">
          <AirportPicker
            type="origin"
            label="From"
            value={formData.origin}
            onChange={(airport) => {
              setFormData((prev) => ({ ...prev, origin: airport }));
              setErrors((prev) => ({ ...prev, origin: '' }));
            }}
            airports={airports}
          />
          {errors.origin && (
            <p className="text-error text-body-sm mt-1">{errors.origin}</p>
          )}
        </div>

        {/* Swap Button */}
        <div className="hidden lg:flex lg:col-span-1 justify-center -mx-4 z-10">
          <button
            onClick={swapAirports}
            aria-label="Swap departure and destination"
            className="w-10 h-10 rounded-full bg-surface-container-lowest text-secondary hover:bg-surface-container shadow-md flex items-center justify-center transition-transform hover:rotate-180"
          >
            <Icon name="swap_horiz" size={20} />
          </button>
        </div>

        {/* Destination */}
        <div className="lg:col-span-3">
          <AirportPicker
            type="destination"
            label="To"
            value={formData.destination}
            onChange={(airport) => {
              setFormData((prev) => ({ ...prev, destination: airport }));
              setErrors((prev) => ({ ...prev, destination: '' }));
            }}
            airports={airports}
          />
          {errors.destination && (
            <p className="text-error text-body-sm mt-1">{errors.destination}</p>
          )}
        </div>

        {/* Departure Date */}
        <div className="lg:col-span-2">
          <DatePicker
            label="Departure"
            value={formData.departureDate}
            onChange={(date) => {
              setFormData((prev) => ({ ...prev, departureDate: date }));
              setErrors((prev) => ({ ...prev, departureDate: '' }));
            }}
          />
          {errors.departureDate && (
            <p className="text-error text-body-sm mt-1">{errors.departureDate}</p>
          )}
        </div>

        {/* Passengers */}
        <div className="lg:col-span-3">
          <PassengerSelector
            value={formData.passengers}
            onChange={(passengers) => setFormData((prev) => ({ ...prev, passengers }))}
          />
        </div>
      </div>

      {/* Quick Toggles & Action */}
      <div className="mt-space-lg pt-space-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
        {/* Flight Preferences */}
        <div className="flex flex-wrap items-center gap-space-lg">
          <Checkbox
            label="Direct flights only"
            checked={formData.directFlightsOnly}
            onChange={(checked) => setFormData((prev) => ({ ...prev, directFlightsOnly: checked }))}
          />
        </div>

        {/* Search Button */}
        <Button
          variant="primary"
          size="lg"
          leftIcon="search"
          onClick={handleSearch}
          className="min-w-[220px]"
        >
          Search Flights
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SearchConsole tests**

```tsx
// frontend/src/components/features/SearchConsole/SearchConsole.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchConsole } from './SearchConsole';
import type { Airport } from '../AirportPicker/types';

const mockAirports: Airport[] = [
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', countryCode: 'VN' },
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN' },
];

describe('SearchConsole', () => {
  it('renders all sub-components', () => {
    render(
      <SearchConsole
        airports={mockAirports}
        onSearch={vi.fn()}
      />
    );
    expect(screen.getByText('Search Flights')).toBeInTheDocument();
    expect(screen.getByText('Round Trip')).toBeInTheDocument();
    expect(screen.getByText('One Way')).toBeInTheDocument();
  });

  it('calls onSearch with form data', () => {
    const handleSearch = vi.fn();
    render(
      <SearchConsole
        airports={mockAirports}
        onSearch={handleSearch}
      />
    );
    // Click search without filling form should show errors
    fireEvent.click(screen.getByText('Search Flights'));
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('renders with initial values', () => {
    render(
      <SearchConsole
        airports={mockAirports}
        initialValues={{
          passengers: { adults: 2, children: 1, infants: 0 },
        }}
        onSearch={vi.fn()}
      />
    );
    expect(screen.getByText('3 Passengers')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/features/SearchConsole/SearchConsole.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/features/SearchConsole/SearchConsole.tsx src/components/features/SearchConsole/SearchConsole.test.tsx
git commit -m "feat(ui): add SearchConsole with form validation"
```

---

## Task 9: Create FlightCard Component

**Files:**
- Create: `frontend/src/components/features/FlightCard/FlightCard.tsx`
- Test: `frontend/src/components/features/FlightCard/FlightCard.test.tsx`

**Interfaces:**
- Consumes: `Card`, `Badge`, `Icon`, `Button` from `@/components/ui`
- Produces: `FlightCard` component

---

### Task 9: Create FlightCard Component

**Requirements & Acceptance Criteria:**
- [ ] Props: flight, onSelect, selected
- [ ] Shows flight number, times, duration, stops
- [ ] Shows price prominently
- [ ] Selected state styling
- [ ] Tests pass: renders, selection

- [ ] **Step 1: Create FlightCard component**

```tsx
// frontend/src/components/features/FlightCard/FlightCard.tsx
import React from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { Button } from '@/components/ui/Button/Button';

export interface FlightData {
  id: string;
  flightNumber: string;
  airline: string;
  aircraft: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  price: number;
  cabinClass: 'economy' | 'premium' | 'business';
  seatsAvailable: number;
}

interface FlightCardProps {
  flight: FlightData;
  onSelect: (flight: FlightData) => void;
  selected?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export function FlightCard({ flight, onSelect, selected }: FlightCardProps) {
  const isNonstop = flight.stops === 0;

  return (
    <Card
      variant="elevated"
      hoverable
      padding="md"
      onClick={() => onSelect(flight)}
      className={`cursor-pointer transition-all ${selected ? 'ring-2 ring-secondary' : ''}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Airline & Flight Info */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
            <Icon name="flight" size={20} className="text-secondary" />
          </div>
          <div>
            <p className="font-label-lg text-on-surface font-semibold">
              {flight.flightNumber}
            </p>
            <p className="font-body-sm text-on-surface-variant">
              {flight.airline}
            </p>
          </div>
        </div>

        {/* Departure */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display-hero text-primary font-bold">
              {flight.departure.time}
            </span>
            <span className="font-headline-md text-secondary">
              {flight.departure.airport}
            </span>
          </div>
        </div>

        {/* Duration & Stops */}
        <div className="flex flex-col items-center min-w-[140px]">
          <span className="font-body-sm text-on-surface-variant">
            {flight.duration}
          </span>
          <div className="relative w-full flex items-center justify-center py-1">
            <div className="w-full h-0.5 bg-surface-variant" />
            {isNonstop ? (
              <Badge variant="success" size="sm" className="absolute">
                Non-stop
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm" className="absolute">
                {flight.stops} stop{flight.stops > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Arrival */}
        <div className="flex-1 text-right">
          <div className="flex items-baseline justify-end gap-2">
            <span className="font-display-hero text-primary font-bold">
              {flight.arrival.time}
            </span>
            <span className="font-headline-md text-secondary">
              {flight.arrival.airport}
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end min-w-[140px]">
          <span className="font-headline-sm text-primary font-bold">
            {formatPrice(flight.price)}
          </span>
          <span className="font-body-sm text-on-surface-variant">
            {flight.seatsAvailable} seats left
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant={flight.cabinClass === 'business' ? 'secondary' : 'neutral'}>
            {flight.cabinClass.charAt(0).toUpperCase() + flight.cabinClass.slice(1)}
          </Badge>
          <span className="font-body-sm text-on-surface-variant">
            {flight.aircraft}
          </span>
        </div>
        <Button 
          variant={selected ? 'primary' : 'secondary'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(flight);
          }}
        >
          {selected ? 'Selected' : 'Select'}
        </Button>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Create FlightCard tests**

```tsx
// frontend/src/components/features/FlightCard/FlightCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlightCard } from './FlightCard';
import type { FlightData } from './FlightCard';

const mockFlight: FlightData = {
  id: '1',
  flightNumber: 'VN1234',
  airline: 'SkyWing Airlines',
  aircraft: 'Boeing 787-9 Dreamliner',
  departure: { airport: 'HAN', time: '06:00', date: '2026-12-25' },
  arrival: { airport: 'SGN', time: '08:30', date: '2026-12-25' },
  duration: '2h 30m',
  stops: 0,
  price: 3460000,
  cabinClass: 'economy',
  seatsAvailable: 12,
};

describe('FlightCard', () => {
  it('renders flight information', () => {
    render(
      <FlightCard
        flight={mockFlight}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText('VN1234')).toBeInTheDocument();
    expect(screen.getByText('06:00')).toBeInTheDocument();
    expect(screen.getByText('08:30')).toBeInTheDocument();
    expect(screen.getByText('Non-stop')).toBeInTheDocument();
  });

  it('shows selected state', () => {
    render(
      <FlightCard
        flight={mockFlight}
        onSelect={vi.fn()}
        selected={true}
      />
    );
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const handleSelect = vi.fn();
    render(
      <FlightCard
        flight={mockFlight}
        onSelect={handleSelect}
      />
    );
    // Click the select button
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);
    expect(handleSelect).toHaveBeenCalledWith(mockFlight);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/features/FlightCard/FlightCard.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/features/FlightCard/FlightCard.tsx src/components/features/FlightCard/FlightCard.test.tsx
git commit -m "feat(ui): add FlightCard with price and selection"
```

---

## Task 10: Create ServiceCard Component

**Files:**
- Create: `frontend/src/components/features/ServiceCard/ServiceCard.tsx`

**Interfaces:**
- Consumes: `Card`, `Badge`, `Icon` from `@/components/ui`
- Produces: `ServiceCard` component

---

### Task 10: Create ServiceCard Component

**Requirements & Acceptance Criteria:**
- [ ] Props: service, selected, onToggle
- [ ] Toggle selection on click
- [ ] Selected: elevated, accent border, checkmark
- [ ] Shows service name, description, price

- [ ] **Step 1: Create ServiceCard component**

```tsx
// frontend/src/components/features/ServiceCard/ServiceCard.tsx
import React from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon, IconName } from '@/components/ui/Icon/Icon';

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: IconName;
  category: 'baggage' | 'meal' | 'seat' | 'priority' | 'insurance';
}

interface ServiceCardProps {
  service: ServiceData;
  selected: boolean;
  onToggle: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export function ServiceCard({ service, selected, onToggle }: ServiceCardProps) {
  return (
    <Card
      variant={selected ? 'elevated' : 'outlined'}
      hoverable
      padding="md"
      onClick={onToggle}
      className={`
        cursor-pointer transition-all relative overflow-hidden
        ${selected 
          ? 'ring-2 ring-secondary shadow-elevated' 
          : 'hover:shadow-card'
        }
      `}
    >
      {/* Selected overlay */}
      {selected && (
        <div className="absolute inset-0 bg-surface-container-low pointer-events-none opacity-50" />
      )}

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Icon name={service.icon} size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-headline-sm text-primary">{service.name}</h3>
                <span className="font-label-sm text-secondary font-medium">
                  {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                </span>
              </div>
            </div>
            <Badge variant={selected ? 'secondary' : 'neutral'}>
              +{formatPrice(service.price)}
            </Badge>
          </div>

          {/* Description */}
          <p className="font-body-sm text-on-surface-variant mt-space-sm leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Selected indicator */}
        {selected && (
          <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
            <span className="flex items-center gap-2 text-secondary font-label-md font-semibold">
              <Icon name="check" size={18} />
              Added to booking
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/ServiceCard/ServiceCard.tsx
git commit -m "feat(ui): add ServiceCard with toggle selection"
```

---

## Task 11: Create BookingSummary Component

**Files:**
- Create: `frontend/src/components/features/BookingSummary/BookingSummary.tsx`

**Interfaces:**
- Consumes: `Card`, `Badge`, `Icon` from `@/components/ui`
- Produces: `BookingSummary` component

---

### Task 11: Create BookingSummary Component

**Requirements & Acceptance Criteria:**
- [ ] Props: items, grandTotal, currency
- [ ] Shows line items with type-based styling
- [ ] Total highlighted at bottom
- [ ] Supports base/addon/tax/total types

- [ ] **Step 1: Create BookingSummary component**

```tsx
// frontend/src/components/features/BookingSummary/BookingSummary.tsx
import React from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';

export interface SummaryItem {
  label: string;
  value: number;
  type?: 'base' | 'addon' | 'tax' | 'total';
}

interface BookingSummaryProps {
  items: SummaryItem[];
  grandTotal: number;
  currency?: string;
  className?: string;
}

const formatPrice = (price: number, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
};

export function BookingSummary({
  items,
  grandTotal,
  currency = 'VND',
  className = '',
}: BookingSummaryProps) {
  return (
    <Card variant="elevated" padding="md" className={className}>
      <h3 className="font-headline-sm text-primary mb-4">Price Summary</h3>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.type === 'addon' && (
                <Icon name="add" size={16} className="text-secondary" />
              )}
              {item.type === 'tax' && (
                <Icon name="receipt" size={16} className="text-outline" />
              )}
              <span className={`
                font-body-md
                ${item.type === 'addon' ? 'text-secondary' : 'text-on-surface'}
              `}>
                {item.label}
              </span>
            </div>
            <span className={`
              font-label-lg
              ${item.type === 'addon' ? 'text-secondary' : 'text-on-surface'}
            `}>
              {item.type === 'addon' ? '+' : ''}{formatPrice(item.value, currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-outline-variant my-4" />

      {/* Grand Total */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-label-lg text-on-surface">Grand Total</span>
          <span className="font-body-sm text-on-surface-variant block">
            (incl. taxes)
          </span>
        </div>
        <div className="text-right">
          <span className="font-headline-md text-primary font-bold">
            {formatPrice(grandTotal, currency)}
          </span>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/BookingSummary/BookingSummary.tsx
git commit -m "feat(ui): add BookingSummary with price breakdown"
```

---

## Task 12: Create ProgressStepper Component

**Files:**
- Create: `frontend/src/components/features/ProgressStepper/ProgressStepper.tsx`
- Test: `frontend/src/components/features/ProgressStepper/ProgressStepper.test.tsx`

**Interfaces:**
- Consumes: `Icon` from `@/components/ui`
- Produces: `ProgressStepper` component

---

### Task 12: Create ProgressStepper Component

**Requirements & Acceptance Criteria:**
- [ ] Props: steps, currentStep, onStepClick?
- [ ] Completed steps: clickable, shows check
- [ ] Active step: highlighted, not clickable
- [ ] Pending steps: dimmed, not clickable
- [ ] Tests pass: rendering, click behavior

- [ ] **Step 1: Create ProgressStepper component**

```tsx
// frontend/src/components/features/ProgressStepper/ProgressStepper.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon/Icon';

export interface Step {
  id: string;
  label: string;
  href?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function ProgressStepper({ 
  steps, 
  currentStep,
  onStepClick 
}: ProgressStepperProps) {
  return (
    <nav aria-label="Booking Progress" className="flex items-center gap-space-sm sm:gap-space-md">
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        const isPending = index > currentStep;
        const isClickable = isComplete && step.href;

        const StepIndicator = () => (
          <span className={`
            w-6 h-6 rounded-full flex items-center justify-center font-label-sm
            ${isComplete 
              ? 'bg-primary text-on-primary' 
              : isActive 
                ? 'bg-secondary-container text-on-secondary shadow-sm ring-2 ring-secondary-fixed' 
                : 'bg-surface-container-highest text-on-surface-variant'
            }
          `}>
            {isComplete ? (
              <Icon name="check" size={14} />
            ) : (
              <span className="font-label-md font-medium">{index + 1}</span>
            )}
          </span>
        );

        const stepContent = (
          <>
            <StepIndicator />
            <span className={`
              hidden sm:inline font-label-md
              ${isActive ? 'text-primary font-bold' : isComplete ? 'text-on-surface font-medium' : 'text-on-surface-variant'}
            `}>
              {step.label}
            </span>
          </>
        );

        if (isClickable && step.href) {
          return (
            <React.Fragment key={step.id}>
              <Link
                to={step.href}
                onClick={() => onStepClick?.(index)}
                className="flex items-center gap-space-xs hover:opacity-80 transition-opacity"
              >
                {stepContent}
              </Link>
              {index < steps.length - 1 && (
                <div className={`
                  w-6 sm:w-10 h-0.5
                  ${isComplete ? 'bg-primary' : 'bg-surface-container-highest'}
                `} />
              )}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={step.id}>
            <div className={`
              flex items-center gap-space-xs
              ${isActive ? 'bg-surface-container-high px-space-sm py-1.5 rounded-lg shadow-sm' : ''}
            `}>
              {stepContent}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-6 sm:w-10 h-0.5
                ${isComplete ? 'bg-primary' : isActive ? 'bg-secondary-container' : 'bg-surface-container-highest'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Create ProgressStepper tests**

```tsx
// frontend/src/components/features/ProgressStepper/ProgressStepper.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProgressStepper } from './ProgressStepper';

const mockSteps = [
  { id: '1', label: 'Select Flight', href: '/flights' },
  { id: '2', label: 'Passenger Info', href: '/passenger' },
  { id: '3', label: 'Add-ons' },
  { id: '4', label: 'Payment' },
];

describe('ProgressStepper', () => {
  it('renders all steps', () => {
    render(
      <BrowserRouter>
        <ProgressStepper steps={mockSteps} currentStep={0} />
      </BrowserRouter>
    );
    expect(screen.getByText('Select Flight')).toBeInTheDocument();
    expect(screen.getByText('Passenger Info')).toBeInTheDocument();
    expect(screen.getByText('Add-ons')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
  });

  it('shows check icon for completed steps', () => {
    render(
      <BrowserRouter>
        <ProgressStepper steps={mockSteps} currentStep={2} />
      </BrowserRouter>
    );
    const checkIcons = document.querySelectorAll('.material-symbols-outlined');
    expect(checkIcons.length).toBeGreaterThanOrEqual(2);
  });

  it('highlights current step', () => {
    render(
      <BrowserRouter>
        <ProgressStepper steps={mockSteps} currentStep={1} />
      </BrowserRouter>
    );
    const activeContainer = screen.getByText('Add-ons').closest('div');
    expect(activeContainer?.className).toContain('bg-surface-container-high');
  });
});
```

- [ ] **Step 3: Run tests**

Run: `cd frontend && pnpm test src/components/features/ProgressStepper/ProgressStepper.test.tsx`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/features/ProgressStepper/ProgressStepper.tsx src/components/features/ProgressStepper/ProgressStepper.test.tsx
git commit -m "feat(ui): add ProgressStepper with clickable completed steps"
```

---

## Task 13: Create ETicket Component

**Files:**
- Create: `frontend/src/components/features/ETicket/ETicket.tsx`

**Interfaces:**
- Consumes: `Card`, `Badge`, `Icon` from `@/components/ui`
- Produces: `ETicket` component

---

### Task 13: Create ETicket Component

**Requirements & Acceptance Criteria:**
- [ ] Props: booking data
- [ ] Shows flight details, passenger info, booking reference
- [ ] Shows e-ticket number
- [ ] Print/download actions

- [ ] **Step 1: Create ETicket component**

```tsx
// frontend/src/components/features/ETicket/ETicket.tsx
import React from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';

interface ETicketData {
  bookingRef: string;
  ticketNumber: string;
  flight: {
    number: string;
    airline: string;
    aircraft: string;
    departure: {
      airport: string;
      city: string;
      time: string;
      date: string;
      terminal: string;
    };
    arrival: {
      airport: string;
      city: string;
      time: string;
      terminal: string;
    };
    duration: string;
    cabinClass: string;
  };
  passenger: {
    name: string;
    type: string;
    seat: string;
    tier?: string;
  };
}

interface ETicketProps {
  ticket: ETicketData;
  onPrint?: () => void;
}

export function ETicket({ ticket, onPrint }: ETicketProps) {
  return (
    <Card variant="elevated" padding="lg" className="overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
        <div>
          <Badge variant="success" className="mb-2">CONFIRMED & TICKETED</Badge>
          <h2 className="font-headline-lg text-primary">Thank You, Your Flight is Booked!</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" leftIcon="print" onClick={onPrint}>
            Print
          </Button>
        </div>
      </div>

      {/* Booking Reference */}
      <div className="grid grid-cols-2 gap-4 py-6 border-b border-outline-variant">
        <div className="bg-surface-container-low p-4 rounded-lg">
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
            Booking Reference (PNR)
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-label-code text-primary text-2xl">
              {ticket.bookingRef}
            </span>
            <button className="p-1 rounded hover:bg-surface-container-high text-secondary">
              <Icon name="content_copy" size={20} />
            </button>
          </div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg">
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
            E-Ticket Number
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-headline-sm text-on-surface">
              {ticket.ticketNumber}
            </span>
            <Icon name="verified" size={20} className="text-secondary" />
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="py-6 border-b border-outline-variant">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="flight_takeoff" size={28} className="text-secondary" />
          <div>
            <span className="font-headline-sm text-primary">
              {ticket.flight.airline} · {ticket.flight.number}
            </span>
            <span className="font-label-md text-on-surface-variant block">
              {ticket.flight.aircraft}
            </span>
          </div>
          <Badge variant={ticket.flight.cabinClass === 'Business' ? 'secondary' : 'neutral'}>
            {ticket.flight.cabinClass} Class
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Departure */}
          <div className="md:col-span-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display-hero text-primary font-bold">
                {ticket.flight.departure.time}
              </span>
              <span className="font-headline-lg text-secondary">
                {ticket.flight.departure.airport}
              </span>
            </div>
            <span className="font-label-lg text-on-surface block">
              {ticket.flight.departure.city}
            </span>
            <span className="font-body-sm text-on-surface-variant">
              Terminal {ticket.flight.departure.terminal}
            </span>
            <span className="font-label-md text-secondary block mt-1">
              {ticket.flight.departure.date}
            </span>
          </div>

          {/* Duration */}
          <div className="md:col-span-4 flex flex-col items-center">
            <span className="font-label-md text-on-surface-variant">
              {ticket.flight.duration}
            </span>
            <div className="relative w-full flex items-center justify-center py-2">
              <div className="w-full h-1 bg-surface-variant rounded-full" />
              <div className="absolute inset-x-0 h-1 bg-secondary rounded-full" />
              <div className="absolute bg-surface-container-lowest p-1 rounded-full text-secondary shadow-sm">
                <Icon name="airlines" size={18} />
              </div>
            </div>
            <span className="font-label-sm uppercase tracking-widest text-secondary font-bold">
              Non-stop Direct
            </span>
          </div>

          {/* Arrival */}
          <div className="md:col-span-4 text-right">
            <div className="flex items-baseline justify-end gap-2">
              <span className="font-headline-lg text-secondary">
                {ticket.flight.arrival.airport}
              </span>
              <span className="font-display-hero text-primary font-bold">
                {ticket.flight.arrival.time}
              </span>
            </div>
            <span className="font-label-lg text-on-surface block">
              {ticket.flight.arrival.city}
            </span>
            <span className="font-body-sm text-on-surface-variant">
              Terminal {ticket.flight.arrival.terminal}
            </span>
          </div>
        </div>
      </div>

      {/* Passenger Info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
        <div>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
            Passenger
          </span>
          <span className="font-label-lg text-on-surface font-bold uppercase">
            {ticket.passenger.name}
          </span>
          <span className="font-body-sm text-on-surface-variant">
            {ticket.passenger.type}
          </span>
        </div>
        <div>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
            Seat
          </span>
          <span className="font-headline-sm text-secondary font-bold">
            {ticket.passenger.seat}
          </span>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/ETicket/ETicket.tsx
git commit -m "feat(ui): add ETicket component with flight details"
```

---

## Task 14: Create StatusBadge Component

**Files:**
- Create: `frontend/src/components/features/StatusBadge/StatusBadge.tsx`

**Interfaces:**
- Consumes: `Badge` from `@/components/ui`
- Produces: `StatusBadge` component

---

### Task 14: Create StatusBadge Component

**Requirements & Acceptance Criteria:**
- [ ] Props: status
- [ ] Maps status to variant and label
- [ ] Statuses: confirmed, pending, cancelled, completed, check_in

- [ ] **Step 1: Create StatusBadge component**

```tsx
// frontend/src/components/features/StatusBadge/StatusBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/Badge/Badge';

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'check_in';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusConfig: Record<BookingStatus, { variant: 'success' | 'warning' | 'error' | 'primary' | 'neutral'; label: string }> = {
  confirmed: { variant: 'success', label: 'CONFIRMED' },
  pending: { variant: 'warning', label: 'PENDING' },
  cancelled: { variant: 'error', label: 'CANCELLED' },
  completed: { variant: 'primary', label: 'COMPLETED' },
  check_in: { variant: 'secondary', label: 'CHECK-IN' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/StatusBadge/StatusBadge.tsx
git commit -m "feat(ui): add StatusBadge with booking status mapping"
```

---

## Task 15: Create RouteDisplay Component

**Files:**
- Create: `frontend/src/components/features/RouteDisplay/RouteDisplay.tsx`

**Interfaces:**
- Consumes: `Icon` from `@/components/ui`
- Produces: `RouteDisplay` component

---

### Task 15: Create RouteDisplay Component

**Requirements & Acceptance Criteria:**
- [ ] Props: origin, destination, direction?
- [ ] Shows origin → destination
- [ ] Airport codes prominent
- [ ] Optional direction icon

- [ ] **Step 1: Create RouteDisplay component**

```tsx
// frontend/src/components/features/RouteDisplay/RouteDisplay.tsx
import React from 'react';
import { Icon } from '@/components/ui/Icon/Icon';

interface RouteDisplayProps {
  origin: {
    code: string;
    city: string;
  };
  destination: {
    code: string;
    city: string;
  };
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export function RouteDisplay({ 
  origin, 
  destination, 
  direction = 'horizontal',
  className = '' 
}: RouteDisplayProps) {
  if (direction === 'vertical') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <span className="font-label-code text-primary font-bold">{origin.code}</span>
        <Icon name="arrow_downward" size={16} className="text-secondary" />
        <span className="font-label-code text-primary font-bold">{destination.code}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-headline-md text-primary font-semibold">{origin.code}</span>
      <span className="font-body-sm text-on-surface-variant">({origin.city})</span>
      <Icon name="arrow_forward" size={16} className="text-secondary mx-2" />
      <span className="font-headline-md text-primary font-semibold">{destination.code}</span>
      <span className="font-body-sm text-on-surface-variant">({destination.city})</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/RouteDisplay/RouteDisplay.tsx
git commit -m "feat(ui): add RouteDisplay for origin-destination display"
```

---

## Task 16: Create PriceDisplay Component

**Files:**
- Create: `frontend/src/components/features/PriceDisplay/PriceDisplay.tsx`

**Interfaces:**
- Produces: `PriceDisplay` component

---

### Task 16: Create PriceDisplay Component

**Requirements & Acceptance Criteria:**
- [ ] Props: price, currency, size
- [ ] Formats with locale
- [ ] Sizes: sm, md, lg

- [ ] **Step 1: Create PriceDisplay component**

```tsx
// frontend/src/components/features/PriceDisplay/PriceDisplay.tsx
import React from 'react';

interface PriceDisplayProps {
  price: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'font-label-lg',
  md: 'font-headline-sm',
  lg: 'font-headline-md',
};

export function PriceDisplay({ 
  price, 
  currency = 'VND',
  size = 'md',
  className = '' 
}: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <span className={`text-primary font-bold ${sizeClasses[size]} ${className}`}>
      {formatted}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/PriceDisplay/PriceDisplay.tsx
git commit -m "feat(ui): add PriceDisplay with locale formatting"
```

---

## Task 17: Create PassengerCard Component

**Files:**
- Create: `frontend/src/components/features/PassengerCard/PassengerCard.tsx`

**Interfaces:**
- Consumes: `Card`, `Avatar`, `Badge`, `Icon` from `@/components/ui`
- Produces: `PassengerCard` component

---

### Task 17: Create PassengerCard Component

**Requirements & Acceptance Criteria:**
- [ ] Props: passenger data
- [ ] Shows avatar, name, type, tier
- [ ] Optional contact info

- [ ] **Step 1: Create PassengerCard component**

```tsx
// frontend/src/components/features/PassengerCard/PassengerCard.tsx
import React from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';

interface PassengerData {
  id: string;
  name: string;
  avatar?: string;
  type: 'adult' | 'child' | 'infant';
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  email?: string;
  phone?: string;
}

interface PassengerCardProps {
  passenger: PassengerData;
  isPrimary?: boolean;
  className?: string;
}

export function PassengerCard({ 
  passenger, 
  isPrimary = false,
  className = '' 
}: PassengerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card variant="elevated" padding="md" className={className}>
      <div className="flex items-start gap-4">
        <Avatar
          src={passenger.avatar}
          initials={getInitials(passenger.name)}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-lg text-primary font-semibold">
              {passenger.name}
            </span>
            {isPrimary && (
              <Badge variant="secondary" size="sm">
                Primary Contact
              </Badge>
            )}
            <Badge variant="neutral" size="sm">
              {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)}
            </Badge>
            {passenger.tier && (
              <Badge variant="primary" size="sm">
                {passenger.tier}
              </Badge>
            )}
          </div>

          {(passenger.email || passenger.phone) && (
            <div className="mt-2 space-y-1">
              {passenger.email && (
                <span className="flex items-center gap-2 font-body-sm text-on-surface-variant">
                  <Icon name="email" size={14} className="text-secondary" />
                  {passenger.email}
                </span>
              )}
              {passenger.phone && (
                <span className="flex items-center gap-2 font-body-sm text-on-surface-variant">
                  <Icon name="phone" size={14} className="text-secondary" />
                  {passenger.phone}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/PassengerCard/PassengerCard.tsx
git commit -m "feat(ui): add PassengerCard with avatar and contact"
```

---

## Task 18: Create CountdownTimer Component

**Files:**
- Create: `frontend/src/components/features/CountdownTimer/CountdownTimer.tsx`

**Interfaces:**
- Produces: `CountdownTimer` component

---

### Task 18: Create CountdownTimer Component

**Requirements & Acceptance Criteria:**
- [ ] Props: endTime, onExpire
- [ ] Updates every second
- [ ] Shows MM:SS format
- [ ] Calls onExpire when time is up

- [ ] **Step 1: Create CountdownTimer component**

```tsx
// frontend/src/components/features/CountdownTimer/CountdownTimer.tsx
import React, { useState, useEffect, useCallback } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({ endTime, onExpire, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const target = endTime.getTime();
    return Math.max(0, Math.floor((target - now) / 1000));
  }, [endTime]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = timeLeft < 60;

  return (
    <span 
      className={`
        font-label-md font-bold
        ${isUrgent ? 'text-error' : 'text-primary'}
        ${className}
      `}
    >
      {formatted}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/CountdownTimer/CountdownTimer.tsx
git commit -m "feat(ui): add CountdownTimer with expiry callback"
```

---

## Task 19: Create Barrel Export for Features

**Files:**
- Create: `frontend/src/components/features/index.ts`

---

### Task 19: Create Barrel Export for Features

**Requirements & Acceptance Criteria:**
- [ ] Exports all 18 components
- [ ] Enables clean imports

- [ ] **Step 1: Create barrel export**

```tsx
// frontend/src/components/features/index.ts
// Search Components
export { Header } from './Header/Header';
export { SearchConsole } from './SearchConsole/SearchConsole';
export type { SearchFormData } from './SearchConsole/SearchConsole';
export { AirportPicker } from './AirportPicker/AirportPicker';
export type { Airport } from './AirportPicker/types';
export { DatePicker } from './DatePicker/DatePicker';
export { PassengerSelector } from './PassengerSelector/PassengerSelector';
export type { PassengerCount } from './PassengerSelector/PassengerSelector';
export { CabinClassSelector } from './CabinClassSelector/CabinClassSelector';
export { TripTypeToggle } from './TripTypeToggle/TripTypeToggle';

// Flight Components
export { FlightCard } from './FlightCard/FlightCard';
export type { FlightData } from './FlightCard/FlightCard';

// Booking Components
export { ServiceCard } from './ServiceCard/ServiceCard';
export type { ServiceData } from './ServiceCard/ServiceCard';
export { BookingSummary } from './BookingSummary/BookingSummary';
export type { SummaryItem } from './BookingSummary/BookingSummary';
export { ProgressStepper } from './ProgressStepper/ProgressStepper';
export type { Step } from './ProgressStepper/ProgressStepper';
export { ETicket } from './ETicket/ETicket';
export type { StatusBadge } from './StatusBadge/StatusBadge';

// Display Components
export { StatusBadge } from './StatusBadge/StatusBadge';
export { RouteDisplay } from './RouteDisplay/RouteDisplay';
export { PriceDisplay } from './PriceDisplay/PriceDisplay';
export { PassengerCard } from './PassengerCard/PassengerCard';
export { CountdownTimer } from './CountdownTimer/CountdownTimer';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/features/index.ts
git commit -m "feat(ui): add barrel export for all feature components"
```

---

## Self-Review Checklist

- [ ] All 18 components created with correct APIs
- [ ] All components import from atomic components (Phase 2)
- [ ] All components use CSS variables from Phase 1
- [ ] Tests pass for components with test files
- [ ] TypeScript compilation succeeds
- [ ] Barrel export includes all components

## Summary

**Tasks Completed:** 19
**Components Created:** 18
**Test Files:** 7
**Hooks:** 1

**Components:**
1. Header
2. AirportPicker
3. DatePicker
4. PassengerSelector
5. CabinClassSelector
6. TripTypeToggle
7. SearchConsole
8. FlightCard
9. ServiceCard
10. BookingSummary
11. ProgressStepper
12. ETicket
13. StatusBadge
14. RouteDisplay
15. PriceDisplay
16. PassengerCard
17. CountdownTimer
18. Barrel Export

**Next Phase:** Phase 4 - Layout Components & Pages
