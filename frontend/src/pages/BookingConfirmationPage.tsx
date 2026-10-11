import React from 'react';
import { Link } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { formatCurrency } from '../utils/formatCurrency';

export interface BookingConfirmationPageProps {
  readonly onPrint?: () => void;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = () => {
  const { confirmedBooking } = useBookingFlow();
  if (!confirmedBooking) {
    return <div className="min-h-screen bg-background flex flex-col"><TopNavBar /><main className="flex-1 pt-16 p-8 text-center"><h1 className="text-headline-lg font-bold text-primary">Không tìm thấy booking vừa xác nhận</h1><p className="mt-2 text-on-surface-variant">Hãy mở My Bookings để xem dữ liệu đã lưu.</p><Link className="inline-block mt-5 text-primary underline" to="/my-bookings">My Bookings</Link></main><Footer /></div>;
  }
  const booking = confirmedBooking;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        <section className="max-w-4xl mx-auto px-6 py-12">
          {/* Success Banner */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h1 className="text-headline-lg font-bold text-primary tracking-tight">
              Booking Confirmed
            </h1>
            <p className="text-body-lg text-on-surface-variant mt-2 max-w-lg mx-auto">
              Your booking and mock payment were successfully recorded.
            </p>
          </div>

          {/* PNR Key Callout */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[11px] font-bold text-outline uppercase tracking-widest block">
                Booking Reference (PNR)
              </span>
              <span className="text-headline-lg font-bold text-primary font-mono tracking-wider">
                {booking.pnr}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(booking.pnr);
                  alert(`Copied PNR ${booking.pnr} to clipboard!`);
                }}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-label-md font-semibold text-primary transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                <span>Copy PNR</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Print Ticket</span>
              </button>
            </div>
          </div>

          {/* Electronic Boarding Pass Ticket View */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl overflow-hidden shadow-lg mb-8">
            {/* Header Ticket Zone */}
            <div className="bg-primary text-on-primary p-6 sm:p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">flight_takeoff</span>
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight block">SkyWing Airlines</span>
                  <span className="text-[12px] opacity-80 uppercase tracking-widest font-semibold">
                    Booking Details • {booking.fareClass.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] opacity-80 uppercase tracking-wider block">Flight</span>
                <span className="text-xl font-mono font-bold">{booking.flight.flightNumber}</span>
              </div>
            </div>

            {/* Flight Path Details */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pb-6 border-b border-outline-variant">
                <div>
                  <span className="text-4xl font-extrabold text-primary">{booking.flight.departureCode}</span>
                  <span className="text-body-md font-bold text-on-surface block mt-1">{booking.flight.departureCity}</span>
                  <span className="text-label-sm text-on-surface-variant block">{booking.departureDate} • {booking.flight.departureTime}</span>
                  <span className="text-[12px] text-secondary font-semibold mt-0.5 block">{booking.flight.departureAirport}</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[12px] font-semibold text-on-surface-variant mb-1">{booking.flight.duration}</span>
                  <div className="relative w-40 flex items-center my-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <div className="flex-1 h-0.5 bg-outline-variant" />
                    <span className="material-symbols-outlined text-[20px] text-primary rotate-90 mx-1">flight</span>
                    <div className="flex-1 h-0.5 bg-outline-variant" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-[11px] text-secondary font-medium">Non-stop • {booking.flight.aircraft}</span>
                </div>

                <div className="md:text-right">
                  <span className="text-4xl font-extrabold text-primary">{booking.flight.arrivalCode}</span>
                  <span className="text-body-md font-bold text-on-surface block mt-1">{booking.flight.arrivalCity}</span>
                  <span className="text-label-sm text-on-surface-variant block">{booking.departureDate} • {booking.flight.arrivalTime}</span>
                  <span className="text-[12px] text-secondary font-semibold mt-0.5 block">{booking.flight.arrivalAirport}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-b border-outline-variant">
                <div>
                  <span className="text-[11px] text-outline uppercase font-semibold block">Passenger</span>
                  <span className="text-label-md font-bold text-primary">
                    {booking.passengers.map(passenger => `${passenger.firstName} ${passenger.lastName}`).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-outline uppercase font-semibold block">Total Paid</span>
                  <span className="text-label-md font-bold text-primary">
                    {formatCurrency(booking.grandTotal)} ({booking.paymentStatus})
                  </span>
                </div>
              </div>

              <p className="pt-5 text-center text-body-sm text-on-surface-variant">Seat assignment and boarding pass are not available yet.</p>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/my-bookings"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md transition-all text-center"
            >
              View In My Bookings
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-primary font-label-lg font-semibold transition-all text-center"
            >
              Book Another Flight
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
