import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassengerSelector } from './PassengerSelector';
import type { PassengerCount } from './PassengerSelector';

describe('PassengerSelector', () => {
  const defaultValue: PassengerCount = {
    adults: 1,
    children: 0,
    infants: 0,
  };

  describe('Trigger rendering', () => {
    it('renders with default label and total passenger count', () => {
      render(<PassengerSelector value={defaultValue} onChange={vi.fn()} />);

      expect(screen.getByText('Passengers & Class')).toBeInTheDocument();
      expect(screen.getByText('1 Passenger')).toBeInTheDocument();
      expect(screen.getByText('Economy Class')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(
        <PassengerSelector
          value={defaultValue}
          onChange={vi.fn()}
          label="Select Guests"
        />
      );

      expect(screen.getByText('Select Guests')).toBeInTheDocument();
    });

    it('displays plural "Passengers" when total count is greater than 1', () => {
      const value: PassengerCount = {
        adults: 2,
        children: 1,
        infants: 0,
      };
      render(<PassengerSelector value={value} onChange={vi.fn()} />);

      expect(screen.getByText('3 Passengers')).toBeInTheDocument();
    });
  });

  describe('Modal interactions', () => {
    it('opens modal when trigger is clicked', () => {
      render(<PassengerSelector value={defaultValue} onChange={vi.fn()} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Passengers' })).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', () => {
      render(<PassengerSelector value={defaultValue} onChange={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes modal when "Done" button is clicked', () => {
      render(<PassengerSelector value={defaultValue} onChange={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Done' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Adults counter', () => {
    it('disables decrement button when adults count is 1 (minimum 1 adult)', () => {
      render(<PassengerSelector value={{ adults: 1, children: 0, infants: 0 }} onChange={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const decreaseBtn = screen.getByRole('button', { name: /decrease adults/i });
      expect(decreaseBtn).toBeDisabled();
    });

    it('increments adults and calls onChange', () => {
      const handleChange = vi.fn();
      render(<PassengerSelector value={{ adults: 1, children: 0, infants: 0 }} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const increaseBtn = screen.getByRole('button', { name: /increase adults/i });
      fireEvent.click(increaseBtn);

      expect(handleChange).toHaveBeenCalledWith({
        adults: 2,
        children: 0,
        infants: 0,
      });
    });

    it('decrements adults when count is greater than 1', () => {
      const handleChange = vi.fn();
      render(<PassengerSelector value={{ adults: 2, children: 0, infants: 0 }} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const decreaseBtn = screen.getByRole('button', { name: /decrease adults/i });
      expect(decreaseBtn).toBeEnabled();

      fireEvent.click(decreaseBtn);
      expect(handleChange).toHaveBeenCalledWith({
        adults: 1,
        children: 0,
        infants: 0,
      });
    });

    it('disables decrement when reducing adults would make adults < infants', () => {
      render(<PassengerSelector value={{ adults: 2, children: 0, infants: 2 }} onChange={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const decreaseAdultsBtn = screen.getByRole('button', { name: /decrease adults/i });
      expect(decreaseAdultsBtn).toBeDisabled();
    });
  });

  describe('Children counter', () => {
    it('disables decrement button when children count is 0', () => {
      render(<PassengerSelector value={{ adults: 1, children: 0, infants: 0 }} onChange={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const decreaseBtn = screen.getByRole('button', { name: /decrease children/i });
      expect(decreaseBtn).toBeDisabled();
    });

    it('increments children and calls onChange', () => {
      const handleChange = vi.fn();
      render(<PassengerSelector value={{ adults: 1, children: 0, infants: 0 }} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const increaseBtn = screen.getByRole('button', { name: /increase children/i });
      fireEvent.click(increaseBtn);

      expect(handleChange).toHaveBeenCalledWith({
        adults: 1,
        children: 1,
        infants: 0,
      });
    });

    it('decrements children when count is greater than 0', () => {
      const handleChange = vi.fn();
      render(<PassengerSelector value={{ adults: 1, children: 2, infants: 0 }} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const decreaseBtn = screen.getByRole('button', { name: /decrease children/i });
      expect(decreaseBtn).toBeEnabled();

      fireEvent.click(decreaseBtn);
      expect(handleChange).toHaveBeenCalledWith({
        adults: 1,
        children: 1,
        infants: 0,
      });
    });
  });

  describe('Infants counter', () => {
    it('disables decrement button when infants count is 0', () => {
      render(<PassengerSelector value={{ adults: 1, children: 0, infants: 0 }} onChange={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const decreaseBtn = screen.getByRole('button', { name: /decrease infants/i });
      expect(decreaseBtn).toBeDisabled();
    });

    it('increments infants when infants < adults and calls onChange', () => {
      const handleChange = vi.fn();
      render(<PassengerSelector value={{ adults: 2, children: 0, infants: 0 }} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const increaseBtn = screen.getByRole('button', { name: /increase infants/i });
      expect(increaseBtn).toBeEnabled();

      fireEvent.click(increaseBtn);
      expect(handleChange).toHaveBeenCalledWith({
        adults: 2,
        children: 0,
        infants: 1,
      });
    });

    it('disables increment button when infants equals adults (infants <= adults rule)', () => {
      render(<PassengerSelector value={{ adults: 1, children: 0, infants: 1 }} onChange={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const increaseBtn = screen.getByRole('button', { name: /increase infants/i });
      expect(increaseBtn).toBeDisabled();
    });

    it('decrements infants when count is greater than 0', () => {
      const handleChange = vi.fn();
      render(<PassengerSelector value={{ adults: 2, children: 0, infants: 1 }} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const decreaseBtn = screen.getByRole('button', { name: /decrease infants/i });
      expect(decreaseBtn).toBeEnabled();

      fireEvent.click(decreaseBtn);
      expect(handleChange).toHaveBeenCalledWith({
        adults: 2,
        children: 0,
        infants: 0,
      });
    });
  });

  describe('Maximum passenger limit', () => {
    it('disables all increment buttons when total reaches 9', () => {
      const maxPassengers: PassengerCount = {
        adults: 5,
        children: 3,
        infants: 1,
      };
      render(<PassengerSelector value={maxPassengers} onChange={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      expect(screen.getByRole('button', { name: /increase adults/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /increase children/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /increase infants/i })).toBeDisabled();
    });

    it('does not allow total passengers to exceed 9', () => {
      const handleChange = vi.fn();
      const maxPassengers: PassengerCount = {
        adults: 5,
        children: 4,
        infants: 0,
      };
      render(<PassengerSelector value={maxPassengers} onChange={handleChange} />);

      fireEvent.click(screen.getByRole('button', { name: /passengers & class/i }));

      const increaseAdultsBtn = screen.getByRole('button', { name: /increase adults/i });
      fireEvent.click(increaseAdultsBtn);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});
