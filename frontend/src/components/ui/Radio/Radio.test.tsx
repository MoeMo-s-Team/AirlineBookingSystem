import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Radio } from './Radio';

describe('Radio', () => {
  it('renders unchecked by default', () => {
    render(<Radio name="seat" value="window" label="Window" />);
    expect(screen.getByRole('radio')).not.toBeChecked();
    expect(screen.getByText('Window')).toBeInTheDocument();
  });

  it('renders checked when checked prop is true', () => {
    render(<Radio name="seat" value="aisle" checked label="Aisle" />);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('calls onChange with value when clicked', () => {
    const handleChange = vi.fn();
    render(<Radio name="seat" value="middle" onChange={handleChange} label="Middle" />);
    fireEvent.click(screen.getByRole('radio'));
    expect(handleChange).toHaveBeenCalledWith('middle');
  });

  it('disables when disabled prop is true', () => {
    render(<Radio name="seat" value="disabled" disabled label="Disabled" />);
    expect(screen.getByRole('radio')).toBeDisabled();
  });
});
