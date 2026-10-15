import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getNotificationBookingDetail, type NotificationBookingDetail } from '../api/notificationBookingApi';
import { Footer } from '../components/layout/Footer';
import { TopNavBar } from '../components/layout/TopNavBar';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';

export function NotificationBookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { isAuthenticated, user } = useAuth();
  const id = Number(bookingId);
  const validId = Number.isSafeInteger(id) && id > 0;
  const [booking, setBooking] = useState<NotificationBookingDetail | null>(null);
  const [bookingOwnerId, setBookingOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const visibleBooking = booking?.id === id && bookingOwnerId === (user?.id ?? null) ? booking : null;

  useEffect(() => {
    if (!isAuthenticated || !validId) {
      setBooking(null);
      setBookingOwnerId(null);
      setLoading(false);
      return;
    }
    const ownerId = user?.id ?? null;
    let active = true;
    setLoading(true);
    setError(null);
    setBooking(null);
    setBookingOwnerId(null);
    void getNotificationBookingDetail(id)
      .then(result => { if (active) { setBooking(result); setBookingOwnerId(ownerId); } })
      .catch(() => { if (active) setError('Không thể mở đơn đặt vé này. Vui lòng kiểm tra trong lịch sử đặt vé.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, isAuthenticated, user?.id, validId]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <main className="flex-1 pt-16">
        <section className="mx-auto w-full max-w-3xl px-6 py-10">
          <Link to="/notifications" className="text-label-md font-semibold text-secondary hover:underline">← Back to notifications</Link>
          <h1 className="mt-5 text-headline-lg font-bold text-primary">Booking details</h1>

          {!isAuthenticated ? (
            <div className="mt-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
              <p className="text-body-md text-on-surface">Sign in to view your booking.</p>
              <Link to="/sign-in" className="mt-3 inline-block font-semibold text-secondary hover:underline">Sign in</Link>
            </div>
          ) : !validId || error ? (
            <div role="alert" className="mt-6 rounded-xl border border-error/30 bg-surface-container-lowest p-6 text-body-md text-error">
              {error ?? 'Mã đơn đặt vé không hợp lệ.'}
            </div>
          ) : loading ? (
            <div role="status" className="mt-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">Đang tải đơn đặt vé...</div>
          ) : visibleBooking ? (
            <article className="mt-6 space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant pb-5">
                <div>
                  <p className="text-label-sm text-on-surface-variant">Booking code</p>
                  <p className="text-title-lg font-bold text-primary">{visibleBooking.bookingCode}</p>
                </div>
                <span className="rounded-lg bg-surface-container px-3 py-1 text-label-md font-semibold text-primary">{visibleBooking.status}</span>
              </header>
              <section>
                <h2 className="text-title-md font-semibold text-primary">Flight</h2>
                <p className="mt-2 text-body-md text-on-surface">{visibleBooking.flight.origin} → {visibleBooking.flight.destination} · {visibleBooking.flight.flightNumber}</p>
                <p className="text-body-sm text-on-surface-variant">Departure: {new Date(visibleBooking.flight.departureTime).toLocaleString('vi-VN')}</p>
                <p className="text-body-sm text-on-surface-variant">Fare: {visibleBooking.fareClass.name}</p>
              </section>
              <section>
                <h2 className="text-title-md font-semibold text-primary">Passengers</h2>
                <ul className="mt-2 list-inside list-disc text-body-md text-on-surface">
                  {visibleBooking.passengers.map(passenger => <li key={passenger.id}>{passenger.fullName}</li>)}
                </ul>
              </section>
              {visibleBooking.services.length > 0 && (
                <section>
                  <h2 className="text-title-md font-semibold text-primary">Additional services</h2>
                  <ul className="mt-2 space-y-1 text-body-md text-on-surface">
                    {visibleBooking.services.map(service => (
                      <li key={service.id}>{service.name} × {service.quantity} — {formatCurrency(service.unitPrice * service.quantity)}</li>
                    ))}
                  </ul>
                </section>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-5">
                <span className="text-title-md font-semibold text-primary">Total</span>
                <span className="text-title-lg font-bold text-primary">{formatCurrency(visibleBooking.totalPrice)}</span>
              </div>
              {visibleBooking.payment && <p className="text-body-sm text-on-surface-variant">Payment: {visibleBooking.payment.status}</p>}
            </article>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
