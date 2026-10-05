import React from 'react';
import { Booking } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export interface BookingDossierModalProps {
  readonly booking: Booking | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCancelBooking?: (pnr: string) => void;
}

export const BookingDossierModal: React.FC<BookingDossierModalProps> = ({
  booking,
  isOpen,
  onClose,
  onCancelBooking
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-outline-variant">
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-headline-sm font-bold text-primary">
                  Booking Dossier & E-Ticket
                </h2>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-label-sm text-on-surface-variant font-mono">
                PNR Record: <span className="font-bold text-primary">{booking.pnr}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Dossier Content */}
        <div className="p-6 space-y-6">
          {/* Boarding Pass Hero Ticket Container */}
          <div className="bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[11px] uppercase tracking-widest opacity-80 font-bold block">
                  SkyWing Electronic Boarding Pass
                </span>
                <span className="text-headline-md font-bold block mt-0.5">
                  {booking.flight.airline} {booking.flight.flightNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-widest opacity-80 block">Cabin Class</span>
                <span className="text-label-lg font-bold">{booking.fareClass.tier}</span>
              </div>
            </div>

            {/* Flight Route In Ticket */}
            <div className="grid grid-cols-3 gap-2 items-center mb-6">
              <div>
                <span className="text-3xl font-extrabold block">{booking.flight.departureCode}</span>
                <span className="text-[12px] opacity-90 block">{booking.flight.departureCity}</span>
                <span className="text-label-md font-bold mt-1 block">{booking.flight.departureTime}</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[11px] opacity-80 mb-1">{booking.flight.duration}</span>
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
                <span className="text-[10px] opacity-80 mt-1">{booking.flight.aircraft}</span>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold block">{booking.flight.arrivalCode}</span>
                <span className="text-[12px] opacity-90 block">{booking.flight.arrivalCity}</span>
                <span className="text-label-md font-bold mt-1 block">{booking.flight.arrivalTime}</span>
              </div>
            </div>

            {/* Gate, Seat, Boarding Time */}
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 grid grid-cols-3 gap-2 text-center border border-white/15">
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-80 block">Gate</span>
                <span className="text-headline-sm font-bold">{booking.gate || 'Gate 12'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-80 block">Seat</span>
                <span className="text-headline-sm font-bold">{booking.seatAssignment || '03A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-80 block">Boarding Time</span>
                <span className="text-headline-sm font-bold">45m Prior</span>
              </div>
            </div>
          </div>

          {/* Passenger & Document Details */}
          <div>
            <h3 className="text-label-lg font-bold text-primary uppercase tracking-wider mb-3">
              Passenger Manifest
            </h3>
            {booking.passengers.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <span className="text-label-md font-bold text-primary block">
                    {p.title}. {p.lastName} {p.firstName}
                  </span>
                  <span className="text-[12px] text-on-surface-variant block mt-0.5">
                    Passport: {p.passportNumber} • Nationality: {p.nationality}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[12px] text-on-surface-variant block">Contact: {p.email}</span>
                  <span className="text-[12px] text-secondary font-medium block">{p.phone}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ancillary Services Attached */}
          {booking.services.length > 0 && (
            <div>
              <h3 className="text-label-lg font-bold text-primary uppercase tracking-wider mb-3">
                Confirmed Add-on Services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {booking.services.map(svc => (
                  <div key={svc.id} className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-secondary">{svc.icon}</span>
                    <div>
                      <span className="text-label-md font-semibold text-primary block">{svc.name}</span>
                      <span className="text-[11px] text-on-surface-variant">${svc.price} Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barcode Mock */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col items-center text-center">
            <span className="text-[10px] text-outline uppercase tracking-widest font-bold mb-2">
              Automated Airport Gate Scanner Code
            </span>
            <div className="h-14 w-full max-w-sm flex items-center justify-between px-2 bg-white rounded border border-outline-variant">
              {Array.from({ length: 42 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-10 bg-on-surface ${
                    i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-1.5' : 'w-0.5'
                  }`}
                />
              ))}
            </div>
            <span className="text-label-sm font-mono text-outline mt-2 tracking-widest">
              {booking.pnr} - {booking.flight.flightNumber} - {booking.departureDate}
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row justify-between gap-3">
          {booking.status === 'CONFIRMED' && onCancelBooking && (
            <button
              type="button"
              onClick={() => {
                onCancelBooking(booking.pnr);
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-label-md font-bold text-error border border-error/40 hover:bg-error-container/20 transition-colors"
            >
              Cancel This Booking
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-surface-container text-label-md font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Boarding Pass</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
