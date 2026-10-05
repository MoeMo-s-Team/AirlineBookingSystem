import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders material symbol icon with name', () => {
    render(<Icon name="search" />);
    const icon = screen.getByText('search');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('material-symbols-outlined');
    expect(icon).toHaveStyle({ fontSize: '20px' });
  });

  it('renders custom size and className', () => {
    render(<Icon name="close" size={24} className="text-primary" />);
    const icon = screen.getByText('close');
    expect(icon).toHaveClass('text-primary');
    expect(icon).toHaveStyle({ fontSize: '24px' });
  });
});
