import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { PassengerForm } from '../components/passenger/PassengerForm';
import { PriceSummaryCard } from '../components/booking/PriceSummaryCard';
import { useBookingFlow } from '../hooks/useBookingFlow';
import type { BookingPassengerDraft } from '../types/bookingFlow';

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
    selectedServices,
  } = useBookingFlow();
  const [showValidationError, setShowValidationError] = useState(false);

  useEffect(() => {
    if (passengers.length === 0) {
      updatePassenger(0, {
        fullName: '',
        dateOfBirth: '',
        passportNo: '',
        phone: '',
      });
    }
  }, [passengers.length, updatePassenger]);

  const validatePassenger = (p: BookingPassengerDraft): boolean => {
    if (!p) return false;
    if (!p.fullName?.trim() || p.fullName.trim().length < 2) return false;
    if (!p.dateOfBirth) return false;
    const dob = new Date(p.dateOfBirth);
    if (isNaN(dob.getTime()) || dob >= new Date()) return false;
    if (!p.passportNo?.trim() || p.passportNo.trim().length < 5) return false;
    if (!p.phone?.trim() || !/^[\d\s\-+()]{7,20}$/.test(p.phone)) return false;
    return true;
  };

  const isFormValid = useMemo(() => {
    return passengers.length > 0 && passengers.every(validatePassenger);
  }, [passengers]);

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
                  key={index}
                  passenger={passenger}
                  passengerIndex={index}
                  onChange={updatePassenger}
                  forceShowErrors={showValidationError}
                />
              ))}
            </div>

            {/* Price Summary Column */}
            <div className="lg:col-span-4">
              <PriceSummaryCard
                flight={selectedFlight}
                fareClass={selectedFareClass}
                passengerCount={passengers.length}
                selectedServices={selectedServices}
                ctaLabel="Proceed to Services"
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
