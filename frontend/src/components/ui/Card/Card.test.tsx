import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders with children and default variant', () => {
    render(<Card>Card Content</Card>);
    const card = screen.getByText('Card Content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('shadow-card');
  });

  it('renders outlined variant', () => {
    render(<Card variant="outlined">Outlined Card</Card>);
    const card = screen.getByText('Outlined Card');
    expect(card).toHaveClass('border');
  });

  it('handles onClick callback', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    fireEvent.click(screen.getByText('Clickable Card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
