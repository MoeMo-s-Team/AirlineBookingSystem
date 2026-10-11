import { BookingDetailResponse } from './bookingApi';
import { AIRPORTS, STANDARD_FARE_CLASSES } from '../data/mockData';
import { Booking, Flight } from '../types';

export function toBookingView(response: BookingDetailResponse): Booking {
  const departure = new Date(response.flight.departureTime);
  const arrival = new Date(response.flight.arrivalTime);
  const origin = AIRPORTS.find(item => item.code === response.flight.origin);
  const destination = AIRPORTS.find(item => item.code === response.flight.destination);
  const flight: Flight = {
    id: String(response.flight.id), flightNumber: response.flight.flightNumber, airline: 'SkyWing Airlines',
    departureCity: origin?.city ?? response.flight.origin, departureAirport: origin?.name ?? response.flight.origin,
    departureCode: response.flight.origin, departureTime: formatTime(departure), departureTerminal: '—',
    arrivalCity: destination?.city ?? response.flight.destination, arrivalAirport: destination?.name ?? response.flight.destination,
    arrivalCode: response.flight.destination, arrivalTime: formatTime(arrival), arrivalTerminal: '—',
    duration: `${Math.max(0, Math.round((arrival.getTime() - departure.getTime()) / 60000))} min`, stops: 0,
    aircraft: 'Not specified', basePrice: response.flight.basePrice, seatsAvailable: response.flight.availableSeats,
    onTimeRate: 'N/A', status: departure.getTime() > Date.now() ? 'SCHEDULED' : 'DEPARTED', fareClasses: []
  };
  const fareCode = response.fareClass.code.toLowerCase().replace(/[^a-z]/g, '');
  const fareName = response.fareClass.name.toLowerCase().replace(/[^a-z]/g, '');
  const tier = STANDARD_FARE_CLASSES.find(item => item.name.toLowerCase().replace(/[^a-z]/g, '') === fareName)
    ?? [...STANDARD_FARE_CLASSES].sort((a, b) => b.tier.length - a.tier.length)
    .find(item => fareCode.includes(item.tier.toLowerCase().replace(/[^a-z]/g, '')))
    ?? STANDARD_FARE_CLASSES[0];
  return {
    id: response.id, pnr: response.bookingCode, flight,
    fareClass: { ...tier, id: String(response.fareClass.id), name: response.fareClass.name, price: response.totalPrice },
    passengers: response.passengers.map(passenger => {
      const names = passenger.fullName.trim().split(/\s+/);
      return { id: String(passenger.id), title: 'Mr', firstName: names.slice(0, -1).join(' ') || names[0], lastName: names.length > 1 ? names[names.length - 1] : '', dateOfBirth: passenger.dateOfBirth, nationality: '', passportNumber: passenger.passportNo, passportExpiry: '', email: '', phone: passenger.phone };
    }),
    services: response.services.map(service => ({ id: String(service.serviceId), name: service.name, category: 'baggage', description: '', price: service.unitPrice * service.quantity, icon: 'check' })),
    tripType: 'one-way', departureDate: response.flight.departureTime.slice(0, 10), baseFare: response.priceBreakdown.baseFare,
    taxesAndFees: 0, servicesTotal: response.priceBreakdown.servicesTotal, discount: 0, grandTotal: response.totalPrice,
    status: response.status, bookingDate: response.createdAt.slice(0, 10), paymentMethod: '', paymentStatus: response.status === 'CONFIRMED' ? 'PAID' : 'PENDING'
  };
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(date);
}
