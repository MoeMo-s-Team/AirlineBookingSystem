import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouteDisplay } from './RouteDisplay';

const mockOrigin = { code: 'HAN', city: 'Hanoi' };
const mockDestination = { code: 'SGN', city: 'Ho Chi Minh City' };

describe('RouteDisplay', () => {
  it('renders horizontal route display by default', () => {
    render(<RouteDisplay origin={mockOrigin} destination={mockDestination} />);

    expect(screen.getByText('HAN')).toBeInTheDocument();
    expect(screen.getByText('(Hanoi)')).toBeInTheDocument();
    expect(screen.getByText('SGN')).toBeInTheDocument();
    expect(screen.getByText('(Ho Chi Minh City)')).toBeInTheDocument();
    expect(screen.getByText('arrow_forward')).toBeInTheDocument();
  });

  it('renders vertical route display when direction is vertical', () => {
    render(<RouteDisplay origin={mockOrigin} destination={mockDestination} direction="vertical" />);

    expect(screen.getByText('HAN')).toBeInTheDocument();
    expect(screen.getByText('SGN')).toBeInTheDocument();
    expect(screen.getByText('arrow_downward')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <RouteDisplay origin={mockOrigin} destination={mockDestination} className="custom-route-class" />
    );
    expect(container.firstChild).toHaveClass('custom-route-class');
  });
});
