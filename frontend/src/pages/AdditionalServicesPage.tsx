import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { ServiceCard } from '../components/service/ServiceCard';
import { PriceSummaryCard } from '../components/booking/PriceSummaryCard';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { MOCK_SERVICES } from '../data/mockData';

export interface AdditionalServicesPageProps {
  readonly onProceed?: () => void;
}

export const AdditionalServicesPage: React.FC<AdditionalServicesPageProps> = () => {
  const navigate = useNavigate();
  const {
    selectedFlight,
    selectedFareClass,
    passengers,
    selectedServices,
    toggleService
  } = useBookingFlow();

  const handleContinue = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        {/* Stepper Header */}
        <section className="bg-surface-container-low border-b border-outline-variant py-4 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/passenger"
              className="text-label-md font-semibold text-primary hover:text-secondary flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Passenger Details</span>
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
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">3</span>
                <span>3. Services</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-outline">
                <span className="w-6 h-6 rounded-full bg-surface-container text-outline flex items-center justify-center text-xs">4</span>
                <span className="hidden sm:inline">4. Payment</span>
              </div>
            </div>
          </div>
        </section>

        {/* Services Catalog */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Services List Column */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h1 className="text-headline-lg font-bold text-primary tracking-tight">
                  Enhance Your Flight Experience
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Select ancillary options to travel with maximum comfort, extra luggage, and premium lounge hospitality.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_SERVICES.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={selectedServices.some(s => s.id === service.id)}
                    onToggle={toggleService}
                  />
                ))}
              </div>
            </div>

            {/* Price Summary Column */}
            <div className="lg:col-span-4">
              <PriceSummaryCard
                flight={selectedFlight}
                fareClass={selectedFareClass}
                passengerCount={passengers.length}
                selectedServices={selectedServices}
                ctaLabel="Proceed to Secure Payment"
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
