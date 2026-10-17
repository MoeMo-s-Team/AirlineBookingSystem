import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { bookingApi, type BookingDetail } from '../api/bookingApi';

export interface BookingConfirmationPageProps {
  readonly onPrint?: () => void;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = () => {
  const { bookingId: routeBookingId } = useParams<{ bookingId?: string }>();
  const [searchParams] = useSearchParams();
  const rawId = routeBookingId ?? searchParams.get('bookingId');
  const bookingId = rawId ? Number(rawId) : null;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!bookingId || Number.isNaN(bookingId)) {
      setLoading(false);
      setError('Đơn đặt vé chưa hoàn tất xác nhận hoặc không tìm thấy mã đặt chỗ.');
      return;
    }

    setLoading(true);
    bookingApi
      .getBooking(bookingId)
      .then((data) => {
        if (cancelled) return;
        if (data.status !== 'CONFIRMED') {
          setError('Đơn đặt vé chưa hoàn tất xác nhận.');
        } else {
          setBooking(data);
          setError(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError('Đơn đặt vé chưa hoàn tất xác nhận.');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const handleCopy = () => {
    if (!booking?.bookingCode) return;
    navigator.clipboard?.writeText(booking.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        <section className="max-w-4xl mx-auto px-6 py-12">
          {loading ? (
            <div className="py-20 text-center" role="status">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-body-md text-on-surface-variant">Đang tải thông tin đặt chỗ...</p>
            </div>
          ) : error || !booking ? (
            <div className="bg-surface-container-lowest border border-error/30 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">warning</span>
              </div>
              <h1 className="text-title-lg font-bold text-on-surface mb-2">
                {error ?? 'Đơn đặt vé chưa hoàn tất xác nhận'}
              </h1>
              <p className="text-body-md text-on-surface-variant mb-6">
                Vui lòng kiểm tra lại trạng thái trong danh sách đặt chỗ hoặc liên hệ hỗ trợ.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/my-bookings"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-label-lg transition-colors"
                >
                  Xem trong Quản lý đặt chỗ
                </Link>
                <Link
                  to="/"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-outline hover:bg-surface-container text-primary font-semibold text-label-lg transition-colors"
                >
                  Tìm chuyến bay mới
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Confirmed Banner */}
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>
                <h1 className="text-headline-lg font-bold text-primary tracking-tight">
                  Booking Confirmed
                </h1>
                <p className="text-body-lg text-on-surface-variant mt-2 max-w-lg mx-auto">
                  Đơn đặt vé của bạn đã được xác nhận thành công trên hệ thống.
                </p>
              </div>

              {/* Booking Reference Callout */}
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-[11px] font-bold text-outline uppercase tracking-widest block">
                    Mã đặt chỗ (Booking Code)
                  </span>
                  <span className="text-headline-lg font-bold text-primary font-mono tracking-wider">
                    {booking.bookingCode}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-label-md font-semibold text-primary transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    <span>{copied ? 'Đã sao chép' : 'Sao chép mã'}</span>
                  </button>
                </div>
              </div>

              {/* Authoritative Booking Details Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl overflow-hidden shadow-sm mb-8 p-6 sm:p-8">
                {/* Flight Summary */}
                {booking.flight && (
                  <div className="pb-6 border-b border-outline-variant">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">flight_takeoff</span>
                        <span className="text-title-md font-bold text-primary">
                          Chuyến bay {booking.flight.flightNumber ?? ''}
                        </span>
                      </div>
                      {booking.fareClass?.name && (
                        <span className="text-label-md font-medium px-3 py-1 bg-surface-container-high rounded-full text-on-surface">
                          {booking.fareClass.name}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-md text-on-surface">
                      <div>
                        <span className="text-outline text-label-sm block">Khởi hành</span>
                        <span className="font-bold text-title-md">{booking.flight.originAirport}</span>
                        {booking.flight.departureTime && (
                          <span className="block text-body-sm text-on-surface-variant">
                            {new Date(booking.flight.departureTime).toLocaleString('vi-VN')}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-outline text-label-sm block">Điểm đến</span>
                        <span className="font-bold text-title-md">{booking.flight.destinationAirport}</span>
                        {booking.flight.arrivalTime && (
                          <span className="block text-body-sm text-on-surface-variant">
                            {new Date(booking.flight.arrivalTime).toLocaleString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Passengers List */}
                {booking.passengers && booking.passengers.length > 0 && (
                  <div className="py-6 border-b border-outline-variant">
                    <h2 className="text-title-sm font-bold text-primary mb-3">Hành khách</h2>
                    <ul className="space-y-2">
                      {booking.passengers.map((p, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-body-md">
                          <span className="font-medium text-on-surface">{p.fullName}</span>
                          <span className="text-label-sm text-on-surface-variant font-mono">
                            {p.passportNo ? `Hộ chiếu/CCCD: ${p.passportNo}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ancillary Services */}
                {booking.services && booking.services.length > 0 && (
                  <div className="py-6 border-b border-outline-variant">
                    <h2 className="text-title-sm font-bold text-primary mb-3">Dịch vụ bổ sung</h2>
                    <ul className="space-y-2">
                      {booking.services.map((s, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-body-md">
                          <span className="text-on-surface">
                            {s.serviceName} x{s.quantity}
                          </span>
                          <span className="font-semibold text-on-surface">
                            {((s.unitPrice ?? 0) * (s.quantity ?? 1)).toLocaleString('vi-VN')} ₫
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Total Paid */}
                <div className="pt-6 flex justify-between items-center">
                  <span className="text-title-md font-bold text-primary">Tổng tiền thanh toán</span>
                  <span className="text-headline-sm font-extrabold text-primary">
                    {(booking.totalPrice ?? booking.priceBreakdown?.totalPrice ?? 0).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/my-bookings"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold shadow-md transition-all text-center"
                >
                  Xem trong Quản lý đặt chỗ
                </Link>
                <Link
                  to="/"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-primary font-semibold transition-all text-center"
                >
                  Tìm chuyến bay mới
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};
