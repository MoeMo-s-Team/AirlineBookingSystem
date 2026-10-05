import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders with children', () => {
    render(<Chip>Filter</Chip>);
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
  });

  it('renders selected state styling', () => {
    render(<Chip selected>Selected Filter</Chip>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-on-primary');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Chip onClick={handleClick}>Clickable</Chip>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables click when disabled', () => {
    const handleClick = vi.fn();
    render(<Chip disabled onClick={handleClick}>Disabled</Chip>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
