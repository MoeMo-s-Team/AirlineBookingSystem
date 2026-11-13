import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FareClassSelector } from './FareClassSelector';
import { fareApi } from '../../api/fareApi';

vi.mock('../../api/fareApi', () => ({
  fareApi: {
    getActiveFares: vi.fn(),
    calculatePrice: vi.fn((basePrice: number, multiplier: number, count: number = 1) =>
      Math.round(basePrice * multiplier * count)
    ),
  },
}));

describe('FareClassSelector Component', () => {
  const mockFares = [
    {
      id: 1,
      code: 'ECONOMY',
      name: 'Phổ thông Tiêu chuẩn',
      priceMultiplier: 1.0,
      active: true,
    },
    {
      id: 2,
      code: 'BUSINESS',
      name: 'Thương gia Linh hoạt',
      priceMultiplier: 2.2,
      active: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reuses parent fares across ten selectors and displays database benefits', () => {
    const fares = [{ ...mockFares[0], baggage: '35kg checked', seatPitch: '38 inch', meal: 'Vegetarian meal' }];
    const onSelect = vi.fn();
    render(<>{Array.from({ length: 10 }, (_, index) => (
      <FareClassSelector key={index} fares={fares} basePrice={1000000} onSelectFare={onSelect} />
    ))}</>);
    expect(fareApi.getActiveFares).not.toHaveBeenCalled();
    expect(screen.getAllByText('35kg checked')).toHaveLength(10);
    expect(screen.getAllByText('38 inch')).toHaveLength(10);
    expect(screen.getAllByText('Vegetarian meal')).toHaveLength(10);
    fireEvent.click(screen.getAllByRole('button', { name: /Select fare/ })[0]);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ baggage: '35kg checked', seatPitch: '38 inch', meal: 'Vegetarian meal' }));
  });

  it('renders active fares and calculates total price for 2 passengers correctly', async () => {
    vi.mocked(fareApi.getActiveFares).mockResolvedValue(mockFares);

    render(
      <FareClassSelector
        basePrice={1000000}
        passengerCount={2}
        selectedFareId={1}
        onSelectFare={vi.fn()}
      />
    );

    // Wait for fares to render
    await waitFor(() => {
      expect(screen.getByText('Phổ thông Tiêu chuẩn')).toBeInTheDocument();
      expect(screen.getByText('Thương gia Linh hoạt')).toBeInTheDocument();
    });

    // Check passenger multiplier text for 2 passengers
    expect(screen.getByText(/Total 2 passengers: ₫2,000,000/i)).toBeInTheDocument();
    expect(screen.getByText(/Total 2 passengers: ₫4,400,000/i)).toBeInTheDocument();
  });

  it('triggers onSelectFare with numeric id and pricing properties when clicked', async () => {
    vi.mocked(fareApi.getActiveFares).mockResolvedValue(mockFares);
    const mockOnSelectFare = vi.fn();

    render(
      <FareClassSelector
        basePrice={1000000}
        passengerCount={1}
        selectedFareId={null}
        onSelectFare={mockOnSelectFare}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Select fare Phổ thông Tiêu chuẩn')).toBeInTheDocument();
    });

    const selectButton = screen.getByText('Select fare Phổ thông Tiêu chuẩn');
    fireEvent.click(selectButton);

    expect(mockOnSelectFare).toHaveBeenCalledTimes(1);
    expect(mockOnSelectFare).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1, // Must be numeric
        code: 'ECONOMY',
        priceMultiplier: 1.0,
        price: 1000000,
      })
    );
  });

  it('renders friendly error message when backend fails to respond', async () => {
    vi.mocked(fareApi.getActiveFares).mockRejectedValue(new Error('Connection refused'));

    render(
      <FareClassSelector
        basePrice={1000000}
        passengerCount={1}
        onSelectFare={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Unable to load fare classes")).toBeInTheDocument();
      expect(screen.getByText('Connection refused')).toBeInTheDocument();
    });
  });
});
