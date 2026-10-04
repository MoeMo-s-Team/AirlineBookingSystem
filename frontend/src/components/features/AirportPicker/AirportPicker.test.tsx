import { describe, it, expect, vi } from 'vitest';
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
    expect(screen.getByText('Select origin')).toBeInTheDocument();
    expect(screen.getByText('ORIGIN')).toBeInTheDocument();
  });

  it('renders destination type correctly', () => {
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={vi.fn()}
        label="Destination"
        type="destination"
      />
    );
    expect(screen.getByText('Destination')).toBeInTheDocument();
    expect(screen.getByText('DEST')).toBeInTheDocument();
  });

  it('shows selected airport code, city, and name', () => {
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={vi.fn()}
        value={mockAirports[0]}
      />
    );
    expect(screen.getByText('HAN')).toBeInTheDocument();
    expect(screen.getByText('Hanoi')).toBeInTheDocument();
    expect(screen.getByText('Noi Bai International Airport')).toBeInTheDocument();
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

  it('closes modal on close button click', () => {
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('filters airports based on search query', async () => {
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
    expect(screen.queryByText('Tan Son Nhat International Airport')).not.toBeInTheDocument();
  });

  it('filters airports by city name', async () => {
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByPlaceholderText('Search city or airport');
    fireEvent.change(input, { target: { value: 'Ho Chi Minh' } });

    await waitFor(() => {
      expect(screen.getByText('Tan Son Nhat International Airport')).toBeInTheDocument();
    });
  });

  it('displays "No airports found" when no match is found', async () => {
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByPlaceholderText('Search city or airport');
    fireEvent.change(input, { target: { value: 'XYZNONEXISTENT' } });

    await waitFor(() => {
      expect(screen.getByText('No airports found')).toBeInTheDocument();
    });
  });

  it('selects an airport, calls onChange, and closes modal', async () => {
    const handleChange = vi.fn();
    render(
      <AirportPicker
        airports={mockAirports}
        onChange={handleChange}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByPlaceholderText('Search city or airport');
    fireEvent.change(input, { target: { value: 'DAD' } });

    await waitFor(() => {
      expect(screen.getByText('Da Nang International Airport')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Da Nang International Airport'));
    expect(handleChange).toHaveBeenCalledWith(mockAirports[2]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
