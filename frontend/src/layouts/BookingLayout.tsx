import type { ReactNode } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Header } from '@/components/features/Header/Header';
import { ProgressStepper } from '@/components/features/ProgressStepper/ProgressStepper';
import { BookingSummary } from '@/components/features/BookingSummary/BookingSummary';
import { Button } from '@/components/ui/Button/Button';
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';

export interface BookingLayoutProps {
  children?: ReactNode;
  currentStep?: number;
}

const bookingSteps = [
  { id: 'flight', label: 'Select Flight', href: '/flights' },
  { id: 'passenger', label: 'Passenger Info', href: '/passenger' },
  { id: 'services', label: 'Add-ons', href: '/services' },
  { id: 'payment', label: 'Payment', href: '/payment' },
];

export function BookingLayout({ children, currentStep = 0 }: BookingLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, grandTotal, totalPassengers } = useBooking();

  // Build summary items
  const summaryItems = [
    ...(state.selectedFlight
      ? [{ label: `${state.selectedFlight.flightNumber} × ${totalPassengers}`, value: state.selectedFlight.price * totalPassengers, type: 'base' as const }]
      : []),
    ...state.selectedServices.map((s) => ({
      label: s.name,
      value: s.price,
      type: 'addon' as const,
    })),
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header user={user ? { name: user.name, tier: user.tier } : undefined} />

      <main className="flex-1 pt-16">
        {/* Progress Stepper */}
        <div className="bg-surface-container-low py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <ProgressStepper
              steps={bookingSteps}
              currentStep={currentStep}
              onStepClick={(step) => {
                if (step < currentStep) {
                  navigate(bookingSteps[step].href);
                }
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {children || <Outlet />}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <BookingSummary
                  items={summaryItems}
                  grandTotal={grandTotal}
                />

                {/* Navigation Buttons */}
                <div className="mt-4 flex gap-3">
                  {currentStep > 0 && (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => navigate(bookingSteps[currentStep - 1].href)}
                    >
                      Back
                    </Button>
                  )}
                  {currentStep < 3 && (
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => navigate(bookingSteps[currentStep + 1].href)}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
