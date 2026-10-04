import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceCard } from './ServiceCard';
import type { ServiceData } from './ServiceCard';

const mockService: ServiceData = {
  id: 'svc-1',
  name: 'Extra Baggage (20kg)',
  description: 'Additional 20kg piece for checked luggage.',
  price: 500000,
  icon: 'luggage',
  category: 'baggage',
};

describe('ServiceCard', () => {
  it('renders service information correctly', () => {
    render(
      <ServiceCard
        service={mockService}
        selected={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Extra Baggage (20kg)')).toBeInTheDocument();
    expect(screen.getByText('Baggage')).toBeInTheDocument();
    expect(screen.getByText('Additional 20kg piece for checked luggage.')).toBeInTheDocument();
    expect(screen.getByText(/\+500[.,]000/)).toBeInTheDocument();
  });

  it('renders unselected state without indicator', () => {
    render(
      <ServiceCard
        service={mockService}
        selected={false}
        onToggle={vi.fn()}
      />
    );

    expect(screen.queryByText('Added to booking')).not.toBeInTheDocument();
  });

  it('renders selected state with indicator and styling', () => {
    render(
      <ServiceCard
        service={mockService}
        selected={true}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Added to booking')).toBeInTheDocument();
  });

  it('calls onToggle when card is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <ServiceCard
        service={mockService}
        selected={false}
        onToggle={handleToggle}
      />
    );

    fireEvent.click(screen.getByText('Extra Baggage (20kg)'));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
