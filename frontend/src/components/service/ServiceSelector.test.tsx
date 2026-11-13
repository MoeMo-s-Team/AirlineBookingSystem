import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServiceSelector } from './ServiceSelector';
import { serviceApi } from '../../api/serviceApi';
import { BookingFlowProvider } from '../../context/BookingFlowContext';
import { useBookingFlow } from '../../hooks/useBookingFlow';

vi.mock('../../api/serviceApi', () => ({
  serviceApi: {
    getActiveServices: vi.fn(),
    getTypeMeta: vi.fn((type: string) => ({
      label: type,
      icon: 'room_service',
      color: 'blue',
    })),
  },
}));

describe('ServiceSelector Component', () => {
  const mockServices = [
    {
      id: 10,
      name: 'Kiện hành lý 20kg',
      type: 'BAGGAGE' as const,
      price: 250000,
      active: true,
    },
    {
      id: 11,
      name: 'Suất ăn nóng đặc biệt',
      type: 'MEAL' as const,
      price: 90000,
      active: true,
    },
    {
      id: 12,
      name: 'Dịch vụ đã hết hạn',
      type: 'SEAT' as const,
      price: 50000,
      active: false, // inactive must be filtered out
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders only active services and excludes inactive ones', async () => {
    vi.mocked(serviceApi.getActiveServices).mockResolvedValue(mockServices);

    render(
      <ServiceSelector
        selectedServices={[]}
        onToggleService={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Kiện hành lý 20kg')).toBeInTheDocument();
      expect(screen.getByText('Suất ăn nóng đặc biệt')).toBeInTheDocument();
    });

    expect(screen.queryByText('Dịch vụ đã hết hạn')).toBeNull();
  });

  it('triggers onToggleService when Add Service button is clicked', async () => {
    vi.mocked(serviceApi.getActiveServices).mockResolvedValue(mockServices);
    const mockOnToggle = vi.fn();

    render(
      <ServiceSelector
        selectedServices={[]}
        onToggleService={mockOnToggle}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Kiện hành lý 20kg')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Add Service/i });
    fireEvent.click(addButtons[0]);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 10,
        name: 'Kiện hành lý 20kg',
      })
    );
  });

  it('allows increasing and decreasing service quantity when service is selected', async () => {
    vi.mocked(serviceApi.getActiveServices).mockResolvedValue(mockServices);
    const mockOnUpdateQuantity = vi.fn();

    const selectedServices: any[] = [
      {
        id: 10,
        name: 'Kiện hành lý 20kg',
        type: 'BAGGAGE',
        price: 250000,
        quantity: 2,
      },
    ];

    render(
      <ServiceSelector
        selectedServices={selectedServices}
        onToggleService={vi.fn()}
        onUpdateQuantity={mockOnUpdateQuantity}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Kiện hành lý 20kg')).toBeInTheDocument();
    });

    // Check quantity 2 is displayed
    expect(screen.getByText('2')).toBeInTheDocument();

    // Click decrease button
    const decreaseBtn = screen.getByRole('button', { name: /Decrease quantity/i });
    fireEvent.click(decreaseBtn);
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith(
      10,
      1
    );

    // Click increase button
    const increaseBtn = screen.getByRole('button', { name: /Increase quantity/i });
    fireEvent.click(increaseBtn);
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith(
      10,
      3
    );
  });

  it('updates real booking state and totals when adding, changing quantity, and removing services', async () => {
    vi.mocked(serviceApi.getActiveServices).mockResolvedValue(mockServices);
    const BookingServices = () => {
      const { selectedServices, toggleService, updateServiceQuantity, priceSummary } = useBookingFlow();
      return <>
        <ServiceSelector selectedServices={selectedServices} onToggleService={toggleService} onUpdateQuantity={updateServiceQuantity} />
        <output data-testid="services-total">{priceSummary.servicesTotal}</output>
      </>;
    };
    render(<BookingFlowProvider><BookingServices /></BookingFlowProvider>);

    fireEvent.click((await screen.findAllByRole('button', { name: /Add Service/i }))[0]);
    expect(screen.getByRole('button', { name: /Added/i })).toBeInTheDocument();
    expect(screen.getByTestId('services-total')).toHaveTextContent('250000');

    fireEvent.click(screen.getByRole('button', { name: /Increase quantity/i }));
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByTestId('services-total')).toHaveTextContent('500000');

    fireEvent.click(screen.getByRole('button', { name: /Decrease quantity/i }));
    expect(screen.getByTestId('services-total')).toHaveTextContent('250000');
    fireEvent.click(screen.getByRole('button', { name: /Decrease quantity/i }));
    expect(screen.queryByRole('button', { name: /Added/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('services-total')).toHaveTextContent(/^0$/);

    fireEvent.click(screen.getAllByRole('button', { name: /Add Service/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /Added/i }));
    expect(screen.getByTestId('services-total')).toHaveTextContent(/^0$/);
  });
});
