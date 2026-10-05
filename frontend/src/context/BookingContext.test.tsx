import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingProvider, useBooking, type PassengerInfo } from './BookingContext';
import { flights } from '@/mocks/flights';
import { services } from '@/mocks/services';

const mockPassenger: PassengerInfo = {
  id: 'pass-1',
  type: 'adult',
  title: 'Mr',
  firstName: 'Van An',
  lastName: 'Nguyen',
  dateOfBirth: '1990-01-01',
  nationality: 'Vietnamese',
  email: 'an@example.com',
  phone: '0912345678',
};

function TestBookingComponent() {
  const { state, dispatch, totalPassengers, totalServicesPrice, grandTotal } = useBooking();

  return (
    <div>
      <div data-testid="passenger-count">{totalPassengers}</div>
      <div data-testid="services-price">{totalServicesPrice}</div>
      <div data-testid="grand-total">{grandTotal}</div>
      <div data-testid="flight-number">{state.selectedFlight?.flightNumber || 'none'}</div>
      <div data-testid="passengers-list">
        {state.passengers.map((p) => (
          <span key={p.id} data-testid={`p-${p.id}`}>{p.firstName} {p.lastName}</span>
        ))}
      </div>
      <div data-testid="services-list">
        {state.selectedServices.map((s) => (
          <span key={s.id} data-testid={`s-${s.id}`}>{s.name}</span>
        ))}
      </div>
      <div data-testid="contact-email">{state.contactInfo?.email || 'no-contact'}</div>

      <button
        onClick={() =>
          dispatch({
            type: 'SET_SEARCH',
            payload: {
              passengers: { adults: 2, children: 1, infants: 0 },
              cabinClass: 'economy',
              tripType: 'oneway',
              directFlightsOnly: false,
            },
          })
        }
        data-testid="btn-set-search"
      >
        Set Search
      </button>

      <button
        onClick={() => dispatch({ type: 'SELECT_FLIGHT', payload: flights[0] })}
        data-testid="btn-select-flight"
      >
        Select Flight
      </button>

      <button
        onClick={() => dispatch({ type: 'ADD_PASSENGER', payload: mockPassenger })}
        data-testid="btn-add-passenger"
      >
        Add Passenger
      </button>

      <button
        onClick={() =>
          dispatch({
            type: 'UPDATE_PASSENGER',
            payload: { id: 'pass-1', data: { firstName: 'Van Binh' } },
          })
        }
        data-testid="btn-update-passenger"
      >
        Update Passenger
      </button>

      <button
        onClick={() => dispatch({ type: 'REMOVE_PASSENGER', payload: 'pass-1' })}
        data-testid="btn-remove-passenger"
      >
        Remove Passenger
      </button>

      <button
        onClick={() => dispatch({ type: 'ADD_SERVICE', payload: services[0] })}
        data-testid="btn-add-service"
      >
        Add Service
      </button>

      <button
        onClick={() => dispatch({ type: 'REMOVE_SERVICE', payload: services[0].id })}
        data-testid="btn-remove-service"
      >
        Remove Service
      </button>

      <button
        onClick={() =>
          dispatch({
            type: 'SET_CONTACT',
            payload: { email: 'contact@example.com', phone: '0987654321' },
          })
        }
        data-testid="btn-set-contact"
      >
        Set Contact
      </button>

      <button onClick={() => dispatch({ type: 'RESET' })} data-testid="btn-reset">
        Reset
      </button>
    </div>
  );
}

describe('BookingContext', () => {
  it('throws error when useBooking is used outside BookingProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestBookingComponent />)).toThrow(
      'useBooking must be used within a BookingProvider'
    );
    spy.mockRestore();
  });

  it('provides initial state and calculates default values', () => {
    render(
      <BookingProvider>
        <TestBookingComponent />
      </BookingProvider>
    );

    expect(screen.getByTestId('passenger-count')).toHaveTextContent('1');
    expect(screen.getByTestId('services-price')).toHaveTextContent('0');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('0');
    expect(screen.getByTestId('flight-number')).toHaveTextContent('none');
  });

  it('updates state and recalculates grand total on flight selection and search change', async () => {
    const user = userEvent.setup();
    render(
      <BookingProvider>
        <TestBookingComponent />
      </BookingProvider>
    );

    // Set search with 2 adults + 1 child = 3 passengers
    await user.click(screen.getByTestId('btn-set-search'));
    expect(screen.getByTestId('passenger-count')).toHaveTextContent('3');

    // Select flight (flights[0] has price 3,460,000)
    await user.click(screen.getByTestId('btn-select-flight'));
    expect(screen.getByTestId('flight-number')).toHaveTextContent(flights[0].flightNumber);
    expect(screen.getByTestId('grand-total')).toHaveTextContent(String(flights[0].price * 3));
  });

  it('handles passenger addition, update, and removal', async () => {
    const user = userEvent.setup();
    render(
      <BookingProvider>
        <TestBookingComponent />
      </BookingProvider>
    );

    await user.click(screen.getByTestId('btn-add-passenger'));
    expect(screen.getByTestId('p-pass-1')).toHaveTextContent('Van An Nguyen');

    await user.click(screen.getByTestId('btn-update-passenger'));
    expect(screen.getByTestId('p-pass-1')).toHaveTextContent('Van Binh Nguyen');

    await user.click(screen.getByTestId('btn-remove-passenger'));
    expect(screen.queryByTestId('p-pass-1')).not.toBeInTheDocument();
  });

  it('handles services addition, removal and totals calculation', async () => {
    const user = userEvent.setup();
    render(
      <BookingProvider>
        <TestBookingComponent />
      </BookingProvider>
    );

    await user.click(screen.getByTestId('btn-select-flight'));
    await user.click(screen.getByTestId('btn-add-service'));

    expect(screen.getByTestId('s-svc-1')).toHaveTextContent(services[0].name);
    expect(screen.getByTestId('services-price')).toHaveTextContent(String(services[0].price));
    expect(screen.getByTestId('grand-total')).toHaveTextContent(
      String(flights[0].price * 1 + services[0].price)
    );

    await user.click(screen.getByTestId('btn-remove-service'));
    expect(screen.queryByTestId('s-svc-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('services-price')).toHaveTextContent('0');
  });

  it('sets contact info and resets booking state', async () => {
    const user = userEvent.setup();
    render(
      <BookingProvider>
        <TestBookingComponent />
      </BookingProvider>
    );

    await user.click(screen.getByTestId('btn-set-contact'));
    expect(screen.getByTestId('contact-email')).toHaveTextContent('contact@example.com');

    await user.click(screen.getByTestId('btn-select-flight'));
    await user.click(screen.getByTestId('btn-reset'));

    expect(screen.getByTestId('flight-number')).toHaveTextContent('none');
    expect(screen.getByTestId('contact-email')).toHaveTextContent('no-contact');
    expect(screen.getByTestId('grand-total')).toHaveTextContent('0');
  });
});
