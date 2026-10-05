import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TripTypeToggle } from './TripTypeToggle';
import type { TripTypeToggleProps } from './TripTypeToggle';

describe('TripTypeToggle', () => {
  it('renders all trip type options', () => {
    const handleChange = vi.fn();
    const props: TripTypeToggleProps = {
      value: 'roundtrip',
      onChange: handleChange,
    };
    render(<TripTypeToggle {...props} />);

    expect(screen.getByRole('button', { name: 'Round Trip' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'One Way' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Multi-City' })).toBeInTheDocument();
  });

  it('marks the active option with active styles', () => {
    const handleChange = vi.fn();
    const { rerender } = render(<TripTypeToggle value="roundtrip" onChange={handleChange} />);

    const roundTripBtn = screen.getByRole('button', { name: 'Round Trip' });
    const oneWayBtn = screen.getByRole('button', { name: 'One Way' });

    expect(roundTripBtn).toHaveClass('bg-primary');
    expect(oneWayBtn).not.toHaveClass('bg-primary');

    rerender(<TripTypeToggle value="oneway" onChange={handleChange} />);

    expect(screen.getByRole('button', { name: 'Round Trip' })).not.toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: 'One Way' })).toHaveClass('bg-primary');
  });

  it('calls onChange with the selected trip type when clicked', () => {
    const handleChange = vi.fn();
    render(<TripTypeToggle value="roundtrip" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'One Way' }));
    expect(handleChange).toHaveBeenCalledWith('oneway');

    fireEvent.click(screen.getByRole('button', { name: 'Multi-City' }));
    expect(handleChange).toHaveBeenCalledWith('multicity');

    fireEvent.click(screen.getByRole('button', { name: 'Round Trip' }));
    expect(handleChange).toHaveBeenCalledWith('roundtrip');
  });

  it('supports custom className prop', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <TripTypeToggle value="roundtrip" onChange={handleChange} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
