import { useBookingFlowContext } from '../context/BookingFlowContext';

export function useBookingFlow() {
  return useBookingFlowContext();
}
