import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassengerCard } from './PassengerCard';
import type { PassengerData } from './PassengerCard';

const mockPassenger: PassengerData = {
  id: 'p-1',
  name: 'Nguyen Van A',
  type: 'adult',
  tier: 'Gold',
  email: 'nguyen.vana@example.com',
  phone: '+84 901 234 567',
};

describe('PassengerCard', () => {
  it('renders passenger information', () => {
    render(<PassengerCard passenger={mockPassenger} />);

    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Adult')).toBeInTheDocument();
    expect(screen.getByText('Gold')).toBeInTheDocument();
    expect(screen.getByText('nguyen.vana@example.com')).toBeInTheDocument();
    expect(screen.getByText('+84 901 234 567')).toBeInTheDocument();
  });

  it('renders primary contact badge when isPrimary is true', () => {
    render(<PassengerCard passenger={mockPassenger} isPrimary={true} />);

    expect(screen.getByText('Primary Contact')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PassengerCard passenger={mockPassenger} className="custom-passenger-card" />
    );

    expect(container.firstChild).toHaveClass('custom-passenger-card');
  });
});
