import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ETicket } from './ETicket';
import type { ETicketData } from './ETicket';

const mockTicket: ETicketData = {
  bookingRef: 'SW-894721',
  ticketNumber: '738-2849102847',
  flight: {
    number: 'VN1234',
    airline: 'SkyWing Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    departure: {
      airport: 'HAN',
      city: 'Hanoi',
      time: '06:00',
      date: 'Dec 25, 2026',
      terminal: 'T1',
    },
    arrival: {
      airport: 'SGN',
      city: 'Ho Chi Minh City',
      time: '08:30',
      terminal: 'T2',
    },
    duration: '2h 30m',
    cabinClass: 'Business',
  },
  passenger: {
    name: 'Nguyen Van A',
    type: 'Adult',
    seat: '12A',
    tier: 'Gold',
  },
};

describe('ETicket', () => {
  it('renders booking confirmation and flight details', () => {
    render(<ETicket ticket={mockTicket} />);

    expect(screen.getByText('CONFIRMED & TICKETED')).toBeInTheDocument();
    expect(screen.getByText('SW-894721')).toBeInTheDocument();
    expect(screen.getByText('738-2849102847')).toBeInTheDocument();
    expect(screen.getByText(/SkyWing Airlines · VN1234/)).toBeInTheDocument();
    expect(screen.getByText('HAN')).toBeInTheDocument();
    expect(screen.getByText('SGN')).toBeInTheDocument();
    expect(screen.getByText(/nguyen van a/i)).toBeInTheDocument();
    expect(screen.getByText('12A')).toBeInTheDocument();
  });

  it('triggers onPrint when print button is clicked', () => {
    const handlePrint = vi.fn();
    render(<ETicket ticket={mockTicket} onPrint={handlePrint} />);

    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    expect(handlePrint).toHaveBeenCalledTimes(1);
  });
});
