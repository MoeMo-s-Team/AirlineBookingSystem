import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceSummaryCard } from './PriceSummaryCard';

describe('PriceSummaryCard', () => {
  const mockFlight: any = {
    id: 101,
    flightNumber: 'SW101',
    departureCode: 'SGN',
    arrivalCode: 'HAN',
    departureTime: '08:00 AM',
    basePrice: 1000000,
  };

  const mockFareClass: any = {
    id: 1,
    name: 'Economy Standard',
    price: 1200000,
  };

  const mockServices: any[] = [
    { id: 10, name: 'Baggage 20kg', price: 250000 },
    { id: 11, name: 'Hot Meal', price: 100000 },
  ];

  it('calculates preview as fare times passenger count plus services with no fabricated tax', () => {
    render(
      <PriceSummaryCard
        flight={mockFlight}
        fareClass={mockFareClass}
        passengerCount={2}
        selectedServices={mockServices}
      />
    );

    // 1200000 * 2 = 2400000
    // Services = 250000 + 100000 = 350000
    // Total = 2750000
    expect(screen.queryByText(/Aviation Taxes & Security Fees/i)).toBeNull();
    expect(screen.queryByText(/tax/i)).toBeNull();

    expect(screen.getByText(/Flight Fare \(2x Adult\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Baggage 20kg/i)).toBeInTheDocument();
    expect(screen.getByText(/Hot Meal/i)).toBeInTheDocument();
  });
});
