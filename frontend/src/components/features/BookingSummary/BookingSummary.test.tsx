import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingSummary } from './BookingSummary';
import type { SummaryItem } from './BookingSummary';

const mockItems: SummaryItem[] = [
  { label: 'Adult Ticket (x1)', value: 2500000, type: 'base' },
  { label: 'Extra Baggage (20kg)', value: 500000, type: 'addon' },
  { label: 'Airport Taxes & Fees', value: 200000, type: 'tax' },
];

describe('BookingSummary', () => {
  it('renders line items and formatted grand total', () => {
    render(
      <BookingSummary
        items={mockItems}
        grandTotal={3200000}
      />
    );

    expect(screen.getByText('Price Summary')).toBeInTheDocument();
    expect(screen.getByText('Adult Ticket (x1)')).toBeInTheDocument();
    expect(screen.getByText('Extra Baggage (20kg)')).toBeInTheDocument();
    expect(screen.getByText('Airport Taxes & Fees')).toBeInTheDocument();

    expect(screen.getByText('Grand Total')).toBeInTheDocument();
    expect(screen.getByText('(incl. taxes)')).toBeInTheDocument();
    expect(screen.getByText(/3[.,]200[.,]000/)).toBeInTheDocument();
  });

  it('prefixes addon prices with + sign', () => {
    render(
      <BookingSummary
        items={mockItems}
        grandTotal={3200000}
      />
    );

    expect(screen.getByText(/\+500[.,]000/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BookingSummary
        items={mockItems}
        grandTotal={3200000}
        className="custom-summary-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-summary-class');
  });
});
