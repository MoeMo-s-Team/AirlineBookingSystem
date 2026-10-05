import { useNavigate } from 'react-router-dom';
import { BookingLayout } from '@/layouts/BookingLayout';
import { ServiceCard, type ServiceData } from '@/components/features/ServiceCard/ServiceCard';
import { Button } from '@/components/ui/Button/Button';
import { services as mockServices } from '@/mocks/services';
import { useBooking } from '@/context/BookingContext';

export function ServicesPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useBooking();

  const toggleService = (service: ServiceData) => {
    const isSelected = state.selectedServices.some((s) => s.id === service.id);
    if (isSelected) {
      dispatch({ type: 'REMOVE_SERVICE', payload: service.id });
    } else {
      dispatch({ type: 'ADD_SERVICE', payload: service });
    }
  };

  return (
    <BookingLayout currentStep={2}>
      <div className="space-y-6">
        <div>
          <h1 className="text-headline-lg text-primary">
            Customize Your Trip
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Enhance your journey with extra services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={state.selectedServices.some((s) => s.id === service.id)}
              onToggle={() => toggleService(service)}
            />
          ))}
        </div>

        <div className="pt-6 border-t border-outline-variant flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/payment')}
          >
            Continue to Payment
          </Button>
        </div>
      </div>
    </BookingLayout>
  );
}
