import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByText('Boeing 787-9 Dreamliner')).toBeInTheDocument();
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
