import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders progress_activity icon with default md size', () => {
    render(<Spinner />);
    const spinner = screen.getByText('progress_activity');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveStyle({ fontSize: '20px' });
  });

  it('renders custom size and className', () => {
    render(<Spinner size="lg" className="text-secondary" />);
    const spinner = screen.getByText('progress_activity');
    expect(spinner).toHaveClass('text-secondary');
    expect(spinner).toHaveStyle({ fontSize: '32px' });
  });
});
