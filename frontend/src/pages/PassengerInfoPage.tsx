import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { PassengerForm } from '../components/passenger/PassengerForm';
import { PriceSummaryCard } from '../components/booking/PriceSummaryCard';
import { useBookingFlow } from '../hooks/useBookingFlow';

export interface PassengerInfoPageProps {
  readonly onProceed?: () => void;
}

export const PassengerInfoPage: React.FC<PassengerInfoPageProps> = () => {
  const navigate = useNavigate();
  const {
    selectedFlight,
    selectedFareClass,
    passengers,
    updatePassenger,
    selectedServices
  } = useBookingFlow();
  const [showValidationError, setShowValidationError] = useState(false);

  const validatePassenger = (p: typeof passengers[0]): boolean => {
    if (!p.firstName.trim() || p.firstName.trim().length < 2) return false;
    if (!p.lastName.trim() || p.lastName.trim().length < 2) return false;
    if (!p.dateOfBirth) return false;
    const dob = new Date(p.dateOfBirth);
    if (dob >= new Date()) return false;
    if (!p.nationality.trim()) return false;
    if (!p.passportNumber.trim() || p.passportNumber.trim().length < 5) return false;
    if (!p.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return false;
    if (!p.phone.trim() || !/^[\d\s\-+()]{8,20}$/.test(p.phone)) return false;
    return true;
  };

  const isFormValid = useMemo(() => passengers.every(validatePassenger), [passengers]);

  const handleContinue = () => {
    if (!isFormValid) {
      setShowValidationError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowValidationError(false);
    navigate('/services');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        {/* Stepper Header */}
        <section className="bg-surface-container-low border-b border-outline-variant py-4 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/flights"
              className="text-label-md font-semibold text-primary hover:text-secondary flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Flights</span>
            </Link>

            {/* Stepper Navigation */}
            <div className="flex items-center gap-2 sm:gap-6 text-label-md">
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center text-xs font-bold">✓</span>
                <span className="hidden sm:inline font-semibold">1. Flight</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">2</span>
                <span>2. Passenger</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-outline">
                <span className="w-6 h-6 rounded-full bg-surface-container text-outline flex items-center justify-center text-xs">3</span>
                <span className="hidden sm:inline">3. Services</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-outline">
                <span className="w-6 h-6 rounded-full bg-surface-container text-outline flex items-center justify-center text-xs">4</span>
                <span className="hidden sm:inline">4. Payment</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form Body and Summary Grid */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h1 className="text-headline-lg font-bold text-primary tracking-tight">
                  Passenger Information
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Enter legal passenger names as displayed on government passports or travel IDs.
                </p>
              </div>

              {/* Validation Error Banner */}
              {showValidationError && (
                <div className="bg-error-container border border-error/30 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-error text-xl mt-0.5">error</span>
                  <div>
                    <p className="text-error font-semibold">Please complete all required passenger information</p>
                    <p className="text-error/70 text-body-sm mt-1">
                      All fields marked with * are required. Please fill in all passenger details before continuing.
                    </p>
                  </div>
                </div>
              )}

              {passengers.map((passenger, index) => (
                <PassengerForm
                  key={passenger.id}
                  passenger={passenger}
                  passengerIndex={index}
                  onChange={updatePassenger}
                  forceShowErrors={showValidationError}
                />
              ))}

              {/* Emergency Contact */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
                <h3 className="text-headline-sm font-bold text-primary mb-3">
                  Emergency Contact & Flight Alert Notification
                </h3>
                <p className="text-body-sm text-on-surface-variant mb-4">
                  We will send automated SMS gate changes and flight departure alerts to this traveler.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                      Contact Person Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Nguyen Van B"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                      Emergency Telephone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+84 903 999 888"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary Column */}
            <div className="lg:col-span-4">
              <PriceSummaryCard
                flight={selectedFlight}
                fareClass={selectedFareClass}
                passengerCount={passengers.length}
                selectedServices={selectedServices}
                ctaLabel="Continue to Add-on Services"
                onCtaClick={handleContinue}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
