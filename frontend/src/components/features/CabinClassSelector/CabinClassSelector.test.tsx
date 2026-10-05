import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CabinClassSelector } from './CabinClassSelector';
import type { CabinClass, CabinClassSelectorProps } from './CabinClassSelector';

describe('CabinClassSelector', () => {
  it('renders all cabin class options', () => {
    const handleChange = vi.fn();
    const initialClass: CabinClass = 'economy';
    const props: CabinClassSelectorProps = {
      value: initialClass,
      onChange: handleChange,
    };
    render(<CabinClassSelector {...props} />);

    expect(screen.getByRole('button', { name: 'Economy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Premium Economy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Business' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument();
  });

  it('marks the currently active cabin class as selected', () => {
    const handleChange = vi.fn();
    const { rerender } = render(<CabinClassSelector value="economy" onChange={handleChange} />);

    const economyBtn = screen.getByRole('button', { name: 'Economy' });
    const businessBtn = screen.getByRole('button', { name: 'Business' });

    expect(economyBtn).toHaveClass('bg-primary');
    expect(businessBtn).not.toHaveClass('bg-primary');

    rerender(<CabinClassSelector value="business" onChange={handleChange} />);

    expect(screen.getByRole('button', { name: 'Economy' })).not.toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: 'Business' })).toHaveClass('bg-primary');
  });

  it('calls onChange with the selected cabin class when clicked', () => {
    const handleChange = vi.fn();
    render(<CabinClassSelector value="economy" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Business' }));
    expect(handleChange).toHaveBeenCalledWith('business');

    fireEvent.click(screen.getByRole('button', { name: 'Premium Economy' }));
    expect(handleChange).toHaveBeenCalledWith('premium_economy');

    fireEvent.click(screen.getByRole('button', { name: 'First' }));
    expect(handleChange).toHaveBeenCalledWith('first');
  });

  it('applies custom className if provided', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <CabinClassSelector value="economy" onChange={handleChange} className="custom-test-class" />
    );

    expect(container.firstChild).toHaveClass('custom-test-class');
  });
});
