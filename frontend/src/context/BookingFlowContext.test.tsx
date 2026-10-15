import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BookingFlowProvider } from './BookingFlowContext';
import { useBookingFlow } from '../hooks/useBookingFlow';

const ConsumerA: React.FC = () => {
  const {
    selectedFlight,
    selectedFareClass,
    passengers,
    selectedServices,
    confirmedBooking,
    searchParams,
    setSelectedFlight,
    setSelectedFareClass,
    setPassengers,
    toggleService,
    resetDraft,
  } = useBookingFlow();

  return (
    <div>
      <div data-testid="flight">{selectedFlight ? selectedFlight.flightNumber : 'none'}</div>
      <div data-testid="fare">{selectedFareClass ? selectedFareClass.name : 'none'}</div>
      <div data-testid="passengers-count">{passengers.length}</div>
      <div data-testid="services-count">{selectedServices.length}</div>
      <div data-testid="confirmed">{confirmedBooking ? 'confirmed' : 'none'}</div>
      <div data-testid="trip-type">{searchParams.tripType}</div>

      <button
        onClick={() => {
          setSelectedFlight({
            id: 'FL-1',
            flightNumber: 'SW101',
            airline: 'SkyWing',
            departureCity: 'Hanoi',
            departureAirport: 'Noi Bai',
            departureCode: 'HAN',
            departureTime: '08:00',
            departureTerminal: 'T1',
            arrivalCity: 'Ho Chi Minh',
            arrivalAirport: 'Tan Son Nhat',
            arrivalCode: 'SGN',
            arrivalTime: '10:00',
            arrivalTerminal: 'T1',
            duration: '2h',
            stops: 0,
            aircraft: 'A321',
            basePrice: 1000000,
            seatsAvailable: 50,
            onTimeRate: '95%',
            status: 'SCHEDULED',
            fareClasses: [],
          });
          setSelectedFareClass({
            id: 'FARE-1',
            tier: 'Economy',
            name: 'Economy Saver',
            price: 1000000,
            baggage: '7kg',
            seatPitch: '30in',
            meal: 'None',
            changes: 'Fee applies',
            cancellation: 'Non-refundable',
            milesMultiplier: 1,
            priorityBoarding: false,
            loungeAccess: false,
          });
          setPassengers([
            {
              id: 'p-1',
              title: 'Mr',
              firstName: 'Van',
              lastName: 'Nguyen',
              dateOfBirth: '1990-01-01',
              nationality: 'VN',
              passportNumber: 'C123',
              passportExpiry: '2030-01-01',
              email: 'a@b.com',
              phone: '0901234567',
            },
          ]);
          toggleService({
            id: 'svc-1',
            name: 'Extra Baggage 20kg',
            category: 'baggage',
            description: '20kg check-in',
            price: 250000,
            icon: 'luggage',
          });
        }}
      >
        Set Draft
      </button>

      <button onClick={() => resetDraft && resetDraft()}>Reset</button>
    </div>
  );
};

const ConsumerB: React.FC = () => {
  const { selectedFlight, selectedFareClass, passengers, selectedServices } = useBookingFlow();
  return (
    <div>
      <div data-testid="consumer-b-flight">{selectedFlight ? selectedFlight.flightNumber : 'none'}</div>
      <div data-testid="consumer-b-fare">{selectedFareClass ? selectedFareClass.name : 'none'}</div>
      <div data-testid="consumer-b-passengers">{passengers.length}</div>
      <div data-testid="consumer-b-services">{selectedServices.length}</div>
    </div>
  );
};

describe('BookingFlowContext', () => {
  it('initializes without mock selections or confirmed booking and tripType is one-way', () => {
    render(
      <BookingFlowProvider>
        <ConsumerA />
      </BookingFlowProvider>
    );

    expect(screen.getByTestId('flight').textContent).toBe('none');
    expect(screen.getByTestId('fare').textContent).toBe('none');
    expect(screen.getByTestId('passengers-count').textContent).toBe('0');
    expect(screen.getByTestId('services-count').textContent).toBe('0');
    expect(screen.getByTestId('confirmed').textContent).toBe('none');
    expect(screen.getByTestId('trip-type').textContent).toBe('one-way');
  });

  it('shares and preserves draft state across different consumers in the provider', () => {
    render(
      <BookingFlowProvider>
        <ConsumerA />
        <ConsumerB />
      </BookingFlowProvider>
    );

    expect(screen.getByTestId('consumer-b-flight').textContent).toBe('none');

    act(() => {
      screen.getByText('Set Draft').click();
    });

    expect(screen.getByTestId('flight').textContent).toBe('SW101');
    expect(screen.getByTestId('fare').textContent).toBe('Economy Saver');
    expect(screen.getByTestId('passengers-count').textContent).toBe('1');
    expect(screen.getByTestId('services-count').textContent).toBe('1');

    // Consumer B sees the updated shared draft
    expect(screen.getByTestId('consumer-b-flight').textContent).toBe('SW101');
    expect(screen.getByTestId('consumer-b-fare').textContent).toBe('Economy Saver');
    expect(screen.getByTestId('consumer-b-passengers').textContent).toBe('1');
    expect(screen.getByTestId('consumer-b-services').textContent).toBe('1');

    // Resetting clears the draft back
    act(() => {
      screen.getByText('Reset').click();
    });

    expect(screen.getByTestId('flight').textContent).toBe('none');
    expect(screen.getByTestId('consumer-b-flight').textContent).toBe('none');
  });
});
