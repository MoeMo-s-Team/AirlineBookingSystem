import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from './DatePicker';
import { format, addDays, subDays, startOfToday } from 'date-fns';

describe('DatePicker', () => {
  it('renders with default label and placeholder when no value is provided', () => {
    render(<DatePicker onChange={vi.fn()} />);

    expect(screen.getByText('Select Date')).toBeInTheDocument();
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('renders with custom label and placeholder', () => {
    render(
      <DatePicker
        onChange={vi.fn()}
        label="Departure Date"
        placeholder="Choose your departure"
      />
    );

    expect(screen.getByText('Departure Date')).toBeInTheDocument();
    expect(screen.getByText('Choose your departure')).toBeInTheDocument();
  });

  it('formats and displays selected date correctly', () => {
    const testDate = new Date(2026, 11, 25); // 2026-12-25
    render(<DatePicker value={testDate} onChange={vi.fn()} />);

    expect(screen.getByText('2026-12-25')).toBeInTheDocument();
    expect(screen.getByText(format(testDate, 'EEEE · MMMM d, yyyy'))).toBeInTheDocument();
  });

  it('opens calendar modal when trigger button is clicked', () => {
    render(<DatePicker onChange={vi.fn()} label="Departure Date" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /departure date/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Departure Date' })).toBeInTheDocument();
  });

  it('closes calendar modal when close button is clicked', () => {
    render(<DatePicker onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /select date/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onChange with selected date and closes modal upon date selection', () => {
    const handleChange = vi.fn();
    const today = startOfToday();

    render(<DatePicker onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /select date/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click today's gridcell button in calendar
    const todayCell = screen.getByRole('gridcell', { name: String(today.getDate()) });
    fireEvent.click(todayCell);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(format(handleChange.mock.calls[0][0], 'yyyy-MM-dd')).toBe(
      format(today, 'yyyy-MM-dd')
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('highlights the selected date in calendar', () => {
    const today = startOfToday();
    render(<DatePicker onChange={vi.fn()} value={today} />);

    fireEvent.click(screen.getByRole('button', { name: /select date/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const selectedCell = screen.getByRole('gridcell', { name: String(today.getDate()) });
    expect(selectedCell).toHaveAttribute('aria-selected', 'true');
  });

  it('disables dates before minDate (or today by default)', () => {
    const handleChange = vi.fn();
    const today = startOfToday();
    render(<DatePicker onChange={handleChange} value={today} />);

    fireEvent.click(screen.getByRole('button', { name: /select date/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const yesterday = subDays(today, 1);
    if (yesterday.getMonth() === today.getMonth()) {
      const yesterdayCell = screen.getByRole('gridcell', {
        name: String(yesterday.getDate()),
      });
      expect(yesterdayCell).toBeDisabled();
      fireEvent.click(yesterdayCell);
      expect(handleChange).not.toHaveBeenCalled();
    }
  });

  it('respects custom minDate', () => {
    const handleChange = vi.fn();
    const today = startOfToday();
    const minDate = addDays(today, 5);
    const dayBeforeMin = addDays(today, 4);

    render(
      <DatePicker
        onChange={handleChange}
        minDate={minDate}
        value={today}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /select date/i }));

    if (dayBeforeMin.getMonth() === today.getMonth()) {
      const disabledCell = screen.getByRole('gridcell', {
        name: String(dayBeforeMin.getDate()),
      });
      expect(disabledCell).toBeDisabled();
      fireEvent.click(disabledCell);
      expect(handleChange).not.toHaveBeenCalled();
    }
  });
});
