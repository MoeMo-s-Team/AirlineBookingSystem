import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

const mockOptions = [
  { value: 'vn', label: 'Vietnam' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
];

describe('Select', () => {
  it('renders with label', () => {
    render(<Select label="Country" options={mockOptions} />);
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
  });

  it('renders options correctly', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByText('Vietnam')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'us' } });
    expect(handleChange).toHaveBeenCalledWith('us');
  });

  it('shows error message', () => {
    render(<Select options={mockOptions} error="Country is required" />);
    expect(screen.getByText(/country is required/i)).toBeInTheDocument();
  });

  it('sets aria-invalid attribute when error is present', () => {
    const { rerender } = render(<Select options={mockOptions} error="Invalid" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');

    rerender(<Select options={mockOptions} />);
    expect(select).not.toHaveAttribute('aria-invalid');
  });
});

