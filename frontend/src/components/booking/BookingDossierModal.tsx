import React from 'react';
import { StatusBadge } from '../common/StatusBadge';

export interface BookingDossierModalProps {
  readonly booking: any | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCancelBooking?: (idOrCode: any) => void;
  readonly isLoading?: boolean;
}

export const BookingDossierModal: React.FC<BookingDossierModalProps> = ({
  booking,
  isOpen,
  onClose,
  onCancelBooking,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const code = booking?.bookingCode || booking?.pnr;
  const flight = booking?.flight;
  const fare = booking?.fareClass;
  const passengers = booking?.passengers || [];
  const services = booking?.services || [];
  const origin = flight?.originAirport || flight?.departureCode || '';
  const destination = flight?.destinationAirport || flight?.arrivalCode || '';
  const flightNumber = flight?.flightNumber || '';

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

  const formattedPrice =
    typeof booking?.totalPrice === 'number'
      ? `${booking.totalPrice.toLocaleString('vi-VN')} ₫`
      : typeof booking?.grandTotal === 'number'
      ? `${booking.grandTotal.toLocaleString('vi-VN')} ₫`
      : '0 ₫';

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
                  Booking Dossier
                </h2>
                {booking?.status && <StatusBadge status={booking.status} />}
              </div>
              {code && (
                <p className="text-label-sm text-on-surface-variant font-mono">
                  Mã đặt chỗ: <span className="font-bold text-primary">{code}</span>
                </p>
              )}
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
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-body-md text-on-surface-variant">Đang tải thông tin chi tiết...</p>
          </div>
        ) : !booking ? (
          <div className="p-8 text-center text-on-surface-variant">
            Không tìm thấy thông tin đặt chỗ.
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Flight Route Summary */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-outline font-bold block">
                    Thông tin chuyến bay
                  </span>
                  <span className="text-headline-sm font-bold text-primary block mt-0.5">
                    Chuyến bay {flightNumber}
                  </span>
                </div>
                {fare?.name && (
                  <span className="text-label-md font-semibold px-3 py-1 bg-surface-container rounded-full text-on-surface">
                    {fare.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <span className="text-label-sm text-outline font-semibold block">Khởi hành</span>
                  <span className="text-title-lg font-extrabold text-primary block">{origin}</span>
                  {flight?.departureTime && (
                    <span className="text-body-sm text-on-surface-variant block">
                      {formatDate(flight.departureTime)} • {formatTime(flight.departureTime)}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-label-sm text-outline font-semibold block">Điểm đến</span>
                  <span className="text-title-lg font-extrabold text-primary block">{destination}</span>
                  {flight?.arrivalTime && (
                    <span className="text-body-sm text-on-surface-variant block">
                      {formatDate(flight.arrivalTime)} • {formatTime(flight.arrivalTime)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Passenger Manifest */}
            {passengers.length > 0 && (
              <div>
                <h3 className="text-label-lg font-bold text-primary uppercase tracking-wider mb-3">
                  Danh sách hành khách
                </h3>
                <div className="space-y-2">
                  {passengers.map((p: any, idx: number) => {
                    const name = p.fullName || `${p.lastName || ''} ${p.firstName || ''}`.trim();
                    const passport = p.passportNo || p.passportNumber;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col sm:flex-row justify-between gap-2"
                      >
                        <div>
                          <span className="text-label-md font-bold text-primary block">
                            {name}
                          </span>
                          {passport && (
                            <span className="text-[12px] text-on-surface-variant block mt-0.5 font-mono">
                              Hộ chiếu / CCCD: {passport}
                            </span>
                          )}
                        </div>
                        {p.phone && (
                          <div className="text-left sm:text-right">
                            <span className="text-[12px] text-on-surface-variant block font-mono">
                              ĐT: {p.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ancillary Services Attached */}
            {services.length > 0 && (
              <div>
                <h3 className="text-label-lg font-bold text-primary uppercase tracking-wider mb-3">
                  Dịch vụ bổ sung
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((svc: any, idx: number) => {
                    const name = svc.serviceName || svc.name;
                    const qty = svc.quantity ?? 1;
                    const price = svc.unitPrice ?? svc.price ?? 0;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant flex items-center justify-between gap-3"
                      >
                        <span className="text-label-md font-semibold text-primary block">
                          {name} {qty > 1 ? `x${qty}` : ''}
                        </span>
                        <span className="text-label-sm font-semibold text-on-surface">
                          {(price * qty).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total Price */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-between">
              <span className="text-title-md font-bold text-primary">Tổng tiền thanh toán</span>
              <span className="text-headline-sm font-extrabold text-primary">
                {formattedPrice}
              </span>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-low flex items-center justify-between gap-3">
          {booking?.status === 'PENDING' && onCancelBooking ? (
            <button
              type="button"
              onClick={() => {
                onCancelBooking(booking.id ?? code);
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-label-md font-bold text-error border border-error/40 hover:bg-error-container/20 transition-colors"
            >
              Hủy đặt chỗ
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-label-md font-bold transition-colors ml-auto"
          >
            Đóng (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
