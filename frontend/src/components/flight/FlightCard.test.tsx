import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlightCard } from './FlightCard';
import { MOCK_FLIGHTS } from '../../data/mockData';

describe('FlightCard seat inventory', () => {
  it('shows a low inventory warning for five or fewer remaining seats', () => {
    render(<FlightCard flight={{ ...MOCK_FLIGHTS[0], seatsAvailable: 3 }} onSelectFare={vi.fn()} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Only 3 seats left')).toBeInTheDocument();
  });

  it('blocks fare selection when remaining seats cannot fit the passenger group', () => {
    render(<FlightCard flight={{ ...MOCK_FLIGHTS[0], seatsAvailable: 1 }} passengerCount={2} onSelectFare={vi.fn()} onViewDetails={vi.fn()} />);
    expect(screen.getByRole('button', { name: /View Fares/i })).toBeDisabled();
  });

  it('shows sold out and blocks fare selection when no seats remain', () => {
    render(<FlightCard flight={{ ...MOCK_FLIGHTS[0], seatsAvailable: 0 }} onSelectFare={vi.fn()} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Sold out')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Fares/i })).toBeDisabled();
  });
});
