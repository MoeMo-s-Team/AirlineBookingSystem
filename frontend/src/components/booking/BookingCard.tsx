import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import type { BookingSummary } from '../../api/bookingApi';

export interface BookingCardProps {
  readonly booking: BookingSummary | any;
  readonly onManage: (booking: any) => void;
  readonly onCancel?: (idOrCode: any) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onManage,
  onCancel,
}) => {
  const code = booking.bookingCode || booking.pnr;
  const isPending = booking.status === 'PENDING';
  const flight = booking.flight;
  const fare = booking.fareClass;
  const origin = flight?.originAirport || flight?.departureCode || '';
  const destination = flight?.destinationAirport || flight?.arrivalCode || '';
  const flightNumber = flight?.flightNumber || '';

  const formatTime = (ts?: string) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return ts;
    }
  };

  const formatDate = (ts?: string) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleDateString('vi-VN');
    } catch {
      return ts;
    }
  };

  const passengerNames = booking.passengers
    ? booking.passengers
        .map((p: any) => p.fullName || `${p.lastName || ''} ${p.firstName || ''}`.trim())
        .filter(Boolean)
        .join(', ')
    : '';

  const formattedPrice =
    typeof booking.totalPrice === 'number'
      ? `${booking.totalPrice.toLocaleString('vi-VN')} ₫`
      : typeof booking.grandTotal === 'number'
      ? `${booking.grandTotal.toLocaleString('vi-VN')} ₫`
      : '0 ₫';

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow transition-shadow">
      {/* Top Bar with Code and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant gap-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/60">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block">
              Mã đặt chỗ (Code)
            </span>
            <span className="text-headline-sm font-bold text-primary tracking-wider font-mono">
              {code}
            </span>
          </div>
          <div>
            <span className="text-body-sm text-on-surface-variant block">
              Ngày đặt: {formatDate(booking.createdAt || booking.bookingDate)}
            </span>
            {fare?.name && (
              <span className="text-label-sm font-semibold text-secondary">
                {fare.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={booking.status} />
          <span className="text-headline-sm font-bold text-primary">
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Flight Route Details */}
      <div className="py-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Origin */}
        <div>
          <span className="text-label-sm text-outline font-semibold uppercase tracking-wider block">
            Khởi hành {flight?.departureTime ? `• ${formatDate(flight.departureTime)}` : ''}
          </span>
          <span className="text-headline-md font-bold text-primary block mt-1">
            {origin}
          </span>
          {flight?.departureTime && (
            <span className="text-body-sm font-bold text-on-surface">
              {formatTime(flight.departureTime)}
            </span>
          )}
        </div>

        {/* Flight Midpoint Route Graphic */}
        <div className="flex flex-col items-center justify-center text-center">
          {flightNumber && (
            <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-surface-container mb-1">
              Chuyến bay {flightNumber}
            </span>
          )}
          <div className="relative w-36 sm:w-48 flex items-center my-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="flex-1 h-0.5 bg-outline-variant" />
            <span className="material-symbols-outlined text-[18px] text-primary rotate-90 mx-1">
              flight
            </span>
            <div className="flex-1 h-0.5 bg-outline-variant" />
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>

        {/* Destination */}
        <div className="md:text-right">
          <span className="text-label-sm text-outline font-semibold uppercase tracking-wider block">
            Điểm đến {flight?.arrivalTime ? `• ${formatDate(flight.arrivalTime)}` : ''}
          </span>
          <span className="text-headline-md font-bold text-primary block mt-1">
            {destination}
          </span>
          {flight?.arrivalTime && (
            <span className="text-body-sm font-bold text-on-surface">
              {formatTime(flight.arrivalTime)}
            </span>
          )}
        </div>
      </div>

      {/* Passenger & Actions Footer */}
      <div className="pt-4 border-t border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {passengerNames && (
            <>
              <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
              <span className="text-label-md font-semibold text-primary">
                {passengerNames}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPending && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(booking.id ?? code)}
              className="px-3 py-1.5 rounded-lg text-label-md font-semibold text-error hover:bg-error-container/20 transition-colors"
            >
              Hủy đặt chỗ
            </button>
          )}

          <button
            type="button"
            onClick={() => onManage(booking)}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-label-md font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Xem chi tiết (Dossier)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
