import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceDisplay } from './PriceDisplay';

describe('PriceDisplay', () => {
  it('formats price with VND locale by default', () => {
    render(<PriceDisplay price={2500000} />);
    expect(screen.getByText(/2[.,]500[.,]000/)).toBeInTheDocument();
  });

  it('formats price with custom currency', () => {
    render(<PriceDisplay price={100} currency="USD" />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<PriceDisplay price={1000} size="sm" />);
    expect(screen.getByText(/1[.,]000/)).toHaveClass('font-label-lg');

    rerender(<PriceDisplay price={1000} size="lg" />);
    expect(screen.getByText(/1[.,]000/)).toHaveClass('font-headline-md');
  });

  it('applies custom className', () => {
    render(<PriceDisplay price={1000} className="custom-price-style" />);
    expect(screen.getByText(/1[.,]000/)).toHaveClass('custom-price-style');
  });
});
