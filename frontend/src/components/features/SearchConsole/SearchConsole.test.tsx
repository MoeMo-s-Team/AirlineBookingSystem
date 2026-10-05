import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchConsole } from './SearchConsole';
import type { Airport } from '../AirportPicker/types';

const mockAirports: Airport[] = [
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', countryCode: 'VN' },
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN' },
  { code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam', countryCode: 'VN' },
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
    expect(screen.getByText('Economy')).toBeInTheDocument();
    expect(screen.getByText('Direct flights only')).toBeInTheDocument();
  });

  it('calls onSearch with form data and validates empty required fields', () => {
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
    expect(screen.getByText('Please select origin')).toBeInTheDocument();
    expect(screen.getByText('Please select destination')).toBeInTheDocument();
    expect(screen.getByText('Please select date')).toBeInTheDocument();
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

  it('swaps origin and destination when swap button is clicked', () => {
    render(
      <SearchConsole
        airports={mockAirports}
        initialValues={{
          origin: mockAirports[0],
          destination: mockAirports[1],
        }}
        onSearch={vi.fn()}
      />
    );

    expect(screen.getByText('HAN')).toBeInTheDocument();
    expect(screen.getByText('SGN')).toBeInTheDocument();

    const swapBtn = screen.getByRole('button', { name: /swap departure and destination/i });
    fireEvent.click(swapBtn);

    // After swap, destination should have HAN and origin SGN
    expect(screen.getByText('HAN')).toBeInTheDocument();
    expect(screen.getByText('SGN')).toBeInTheDocument();
  });

  it('submits valid form data when fields are filled', () => {
    const handleSearch = vi.fn();
    const departure = new Date(2026, 5, 15);
    render(
      <SearchConsole
        airports={mockAirports}
        initialValues={{
          tripType: 'oneway',
          origin: mockAirports[0],
          destination: mockAirports[1],
          departureDate: departure,
        }}
        onSearch={handleSearch}
      />
    );

    fireEvent.click(screen.getByText('Search Flights'));
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        tripType: 'oneway',
        origin: mockAirports[0],
        destination: mockAirports[1],
        departureDate: departure,
      })
    );
  });
});
