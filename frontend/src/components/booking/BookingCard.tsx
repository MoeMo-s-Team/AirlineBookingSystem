import React from 'react';
import { Booking } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export interface BookingCardProps {
  readonly booking: Booking;
  readonly onManage: (booking: Booking) => void;
  readonly onCancel?: (pnr: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onManage,
  onCancel
}) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow transition-shadow">
      {/* Top Bar with PNR and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/60">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block">
              PNR / RECORD LOCATOR
            </span>
            <span className="text-headline-sm font-bold text-primary tracking-wider font-mono">
              {booking.pnr}
            </span>
          </div>
          <div>
            <span className="text-body-sm text-on-surface-variant block">
              Booked on {booking.bookingDate}
            </span>
            <span className="text-label-sm font-semibold text-secondary">
              {booking.tripType.toUpperCase().replace('-', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={booking.status} />
          <span className="text-headline-sm font-bold text-primary">
            ${booking.grandTotal}
          </span>
        </div>
      </div>

      {/* Flight Route Details */}
      <div className="py-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Origin / Departure */}
        <div>
          <span className="text-label-sm text-outline font-semibold uppercase tracking-wider block">
            Departure • {booking.departureDate}
          </span>
          <span className="text-headline-md font-bold text-primary block mt-1">
            {booking.flight.departureTime}
          </span>
          <span className="text-body-sm font-bold text-on-surface">
            {booking.flight.departureCity} ({booking.flight.departureCode})
          </span>
          <span className="text-[12px] text-on-surface-variant block">
            {booking.flight.departureAirport} • {booking.flight.departureTerminal}
          </span>
        </div>

        {/* Flight Midpoint Route Graphic */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-surface-container mb-1">
            {booking.flight.airline} • {booking.flight.flightNumber}
          </span>
          <div className="relative w-36 sm:w-48 flex items-center my-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="flex-1 h-0.5 bg-outline-variant" />
            <span className="material-symbols-outlined text-[18px] text-primary rotate-90 mx-1">
              flight
            </span>
            <div className="flex-1 h-0.5 bg-outline-variant" />
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <span className="text-[11px] text-on-surface-variant">
            {booking.flight.duration} • {booking.flight.aircraft}
          </span>
        </div>

        {/* Destination / Arrival */}
        <div className="md:text-right">
          <span className="text-label-sm text-outline font-semibold uppercase tracking-wider block">
            Arrival • {booking.departureDate}
          </span>
          <span className="text-headline-md font-bold text-primary block mt-1">
            {booking.flight.arrivalTime}
          </span>
          <span className="text-body-sm font-bold text-on-surface">
            {booking.flight.arrivalCity} ({booking.flight.arrivalCode})
          </span>
          <span className="text-[12px] text-on-surface-variant block">
            {booking.flight.arrivalAirport} • {booking.flight.arrivalTerminal}
          </span>
        </div>
      </div>

      {/* Passenger & Actions Footer */}
      <div className="pt-4 border-t border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
          <span className="text-label-md font-semibold text-primary">
            {booking.passengers.map(p => `${p.lastName} ${p.firstName}`).join(', ')}
          </span>
          <span className="text-on-surface-variant">•</span>
          <span className="text-label-sm px-2 py-0.5 rounded bg-surface-container text-primary font-medium">
            {booking.fareClass.tier}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {booking.status === 'CONFIRMED' && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(booking.pnr)}
              className="px-3 py-1.5 rounded-lg text-label-md font-semibold text-error hover:bg-error-container/20 transition-colors"
            >
              Cancel Booking
            </button>
          )}

          <button
            type="button"
            onClick={() => onManage(booking)}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>View Dossier & E-Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
