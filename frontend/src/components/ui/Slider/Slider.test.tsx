import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders with label and formatted values', () => {
    render(
      <Slider 
        label="Price" 
        min={100} 
        max={1000} 
        value={500} 
        formatValue={(v) => `$${v}`} 
      />
    );
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$1000')).toBeInTheDocument();
  });

  it('calls onChange with numeric value', () => {
    const handleChange = vi.fn();
    render(<Slider min={0} max={100} value={20} onChange={handleChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(handleChange).toHaveBeenCalledWith(75);
  });
});
