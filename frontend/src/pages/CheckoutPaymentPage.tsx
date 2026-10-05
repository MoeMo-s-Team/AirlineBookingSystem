import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { PriceSummaryCard } from '../components/booking/PriceSummaryCard';
import { useBookingFlow } from '../hooks/useBookingFlow';

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
    confirmBooking
  } = useBookingFlow();

  const [cardName, setCardName] = useState('NGUYEN VAN A');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 9012');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('889');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      confirmBooking();
      setIsProcessing(false);
      navigate('/confirmation');
    }, 800);
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
                  Transactions are encrypted end-to-end with 256-bit bank-grade TLS security protocols.
                </p>
              </div>

              {/* Payment Methods Selector Tabs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'card', label: 'Credit / Debit Card', icon: 'credit_card' },
                  { id: 'bank', label: 'VietQR / Bank Wire', icon: 'account_balance' },
                  { id: 'wallet', label: 'Apple / Google Pay', icon: 'contactless' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPaymentMethod(tab.id as any)}
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

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full pl-3.5 pr-12 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-2.5 text-secondary text-[22px]">
                        credit_card
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                        Security Code (CVV) *
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* VietQR Mock */}
              {paymentMethod === 'bank' && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm text-center">
                  <span className="text-label-md font-bold text-primary block mb-2">
                    Scan VietQR Code with any Banking App in Vietnam
                  </span>
                  <div className="w-48 h-48 mx-auto bg-surface-container border border-outline-variant rounded-xl flex items-center justify-center p-4 my-4">
                    <span className="material-symbols-outlined text-[80px] text-primary">qr_code_2</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    Instant automated confirmation upon successful wire transfer
                  </p>
                </div>
              )}

              {/* Digital Wallets */}
              {paymentMethod === 'wallet' && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm text-center">
                  <span className="material-symbols-outlined text-[48px] text-primary mb-2">contactless</span>
                  <h3 className="text-headline-sm font-bold text-primary mb-1">
                    Express 1-Click Biometric Checkout
                  </h3>
                  <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                    Authorize payment securely via Apple Touch ID / Face ID or Google Pay.
                  </p>
                </div>
              )}

              {/* Security Badges */}
              <div className="flex items-center gap-6 text-on-surface-variant text-body-sm pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">lock</span>
                  <span>256-Bit SSL Encryption</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
                  <span>PCI-DSS Level 1 Certified</span>
                </div>
              </div>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-4">
              <PriceSummaryCard
                flight={selectedFlight}
                fareClass={selectedFareClass}
                passengerCount={passengers.length}
                selectedServices={selectedServices}
                ctaLabel={isProcessing ? 'Authorizing Payment...' : 'Authorize & Issue E-Ticket'}
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
