import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { PriceSummaryCard } from '../components/booking/PriceSummaryCard';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { createBooking, getBooking } from '../api/bookingApi';
import { processPayment } from '../api/paymentApi';

export interface CheckoutPaymentPageProps {
  readonly onPaymentSuccess?: () => void;
}

export const CheckoutPaymentPage: React.FC<CheckoutPaymentPageProps> = () => {
  const navigate = useNavigate();
  const {
    selectedFlight,
    selectedFareClass,
    passengers,
    selectedServices,
    paymentMethod,
    setPaymentMethod,
    completeBooking
  } = useBookingFlow();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);

  const handlePay = async () => {
    if (!selectedFlight || !selectedFareClass || passengers.length === 0) {
      setError('Vui lòng chọn chuyến bay, hạng vé và nhập thông tin hành khách trước.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      let bookingId = pendingBookingId;
      if (bookingId === null) {
        const booking = await createBooking({
          flightId: Number(selectedFlight.id),
          fareClassId: Number(selectedFareClass.id),
          passengers: passengers.map(passenger => ({
            fullName: `${passenger.firstName} ${passenger.lastName}`.trim(),
            dateOfBirth: passenger.dateOfBirth,
            passportNo: passenger.passportNumber,
            phone: passenger.phone
          })),
          services: selectedServices.map(service => ({ serviceId: Number(service.id), quantity: 1 }))
        });
        bookingId = booking.id;
        setPendingBookingId(bookingId);
      }
      const payment = await processPayment(bookingId, paymentMethod === 'card' ? 'CREDIT_CARD' : 'BANK_TRANSFER');
      if (payment.status !== 'SUCCESS') {
        setPendingBookingId(null);
        setError('Thanh toán thất bại; booking được lưu với trạng thái PAYMENT_FAILED. Hãy tạo booking mới để thử lại.');
        return;
      }
      const booking = await getBooking(bookingId);
      completeBooking(booking, payment);
      setPendingBookingId(null);
      navigate('/confirmation');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể hoàn tất booking hoặc thanh toán.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        {/* Stepper Header */}
        <section className="bg-surface-container-low border-b border-outline-variant py-4 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/services"
              className="text-label-md font-semibold text-primary hover:text-secondary flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Services</span>
            </Link>

            {/* Stepper Navigation */}
            <div className="flex items-center gap-2 sm:gap-6 text-label-md">
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center text-xs font-bold">✓</span>
                <span className="hidden sm:inline font-semibold">1. Flight</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center text-xs font-bold">✓</span>
                <span className="hidden sm:inline font-semibold">2. Passenger</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center text-xs font-bold">✓</span>
                <span className="hidden sm:inline font-semibold">3. Services</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">4</span>
                <span>4. Payment</span>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Form */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Payment Method Column */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h1 className="text-headline-lg font-bold text-primary tracking-tight">
                  Secure Checkout & Payment
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Demo checkout uses the backend mock gateway. No real payment is collected.
                </p>
              </div>

              {/* Payment Methods Selector Tabs */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'card', label: 'Credit / Debit Card', icon: 'credit_card' },
                  { id: 'bank', label: 'VietQR / Bank Wire', icon: 'account_balance' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPaymentMethod(tab.id as 'card' | 'bank')}
                    className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                      paymentMethod === tab.id
                        ? 'bg-surface-container-low border-primary ring-2 ring-primary/20 text-primary font-bold shadow-sm'
                        : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-secondary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{tab.icon}</span>
                    <span className="text-label-md">{tab.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
                  <p className="font-semibold text-primary">Mock card payment</p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">Backend demo gateway will simulate a successful card payment. Do not enter real card details.</p>
                </div>
              )}

              {/* VietQR Mock */}
              {paymentMethod === 'bank' && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm text-center">
                  <p className="font-semibold text-primary">Mock bank transfer</p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">Backend demo gateway simulates a successful transfer. No real transfer or QR payment is performed.</p>
                </div>
              )}

              {error && <p role="alert" className="rounded-xl bg-error-container p-4 text-error">{error}</p>}
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-4">
              <PriceSummaryCard
                flight={selectedFlight}
                fareClass={selectedFareClass}
                passengerCount={passengers.length}
                selectedServices={selectedServices}
                ctaLabel={isProcessing ? 'Processing Payment...' : 'Pay & Confirm Booking'}
                onCtaClick={handlePay}
                isCtaDisabled={isProcessing}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
