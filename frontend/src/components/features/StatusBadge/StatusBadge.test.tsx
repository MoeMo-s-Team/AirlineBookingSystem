import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders confirmed status with correct text', () => {
    render(<StatusBadge status="confirmed" />);
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
  });

  it('renders pending status with correct text', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders cancelled status with correct text', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
  });

  it('renders completed status with correct text', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('renders check_in status with correct text', () => {
    render(<StatusBadge status="check_in" />);
    expect(screen.getByText('CHECK-IN')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<StatusBadge status="confirmed" className="custom-badge-class" />);
    expect(container.firstChild).toHaveClass('custom-badge-class');
  });
});
