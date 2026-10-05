import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with children and default variant', () => {
    render(<Badge>Non-stop</Badge>);
    const badge = screen.getByText('Non-stop');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('rounded-full');
  });

  it('renders with custom variant and size', () => {
    render(<Badge variant="primary" size="lg">Economy</Badge>);
    const badge = screen.getByText('Economy');
    expect(badge).toHaveClass('bg-primary-fixed');
    expect(badge).toHaveClass('px-3');
  });

  it('renders success and warning variants with semantic token classes', () => {
    const { rerender } = render(<Badge variant="success">Confirmed</Badge>);
    expect(screen.getByText('Confirmed')).toHaveClass('bg-success-container text-on-success-container');

    rerender(<Badge variant="warning">Delayed</Badge>);
    expect(screen.getByText('Delayed')).toHaveClass('bg-warning-container text-on-warning-container');
  });
});

