import type { BookingSelectedService } from '../types/bookingFlow';

export const bundleTypes = ['BAGGAGE', 'MEAL', 'SEAT'] as const;
export function bundleEligible(services: readonly BookingSelectedService[]) {
  return bundleTypes.every(type => services.some(service => service.type === type && (service.quantity ?? 1) > 0));
}
export function serviceDiscount(services: readonly BookingSelectedService[], enabled: boolean) {
  if (!enabled || !bundleEligible(services)) return 0;
  const subtotal = services.reduce((sum, service) => sum + service.price * (service.quantity ?? 1), 0);
  return Math.round((subtotal * 0.15 + Number.EPSILON) * 100) / 100;
}
