import { act, renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BookingFlowProvider, useBookingFlowContext } from './BookingFlowContext';
import type { BookingSelectedService } from '../types/bookingFlow';

it('discounts service quantities and removes the discount when a required category is removed', () => {
  const services: BookingSelectedService[] = [
    { id: 1, name: 'Baggage', type: 'BAGGAGE', price: 500000, active: true },
    { id: 2, name: 'Meal', type: 'MEAL', price: 200000, active: true },
    { id: 3, name: 'Seat', type: 'SEAT', price: 150000, active: true },
  ];
  const { result } = renderHook(useBookingFlowContext, { wrapper: BookingFlowProvider });
  act(() => { result.current.setSelectedServices?.(services); result.current.setServiceBundle(true); });
  expect(result.current.priceSummary.servicesTotal).toBe(850000);
  expect(result.current.priceSummary.discount).toBe(127500);
  expect(result.current.priceSummary.grandTotal).toBe(722500);
  act(() => result.current.updateServiceQuantity(1, 2));
  expect(result.current.priceSummary.discount).toBe(202500);
  act(() => result.current.toggleService(services[1]));
  expect(result.current.serviceBundle).toBe(false);
  expect(result.current.priceSummary.discount).toBe(0);
});
