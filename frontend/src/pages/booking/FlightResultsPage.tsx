import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingLayout } from '@/layouts/BookingLayout';
import { FlightCard, type FlightData } from '@/components/features/FlightCard/FlightCard';
import { Chip } from '@/components/ui/Chip/Chip';
import { Icon } from '@/components/ui/Icon/Icon';
import { flights as mockFlights } from '@/mocks/flights';
import { useBooking } from '@/context/BookingContext';

export function FlightResultsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useBooking();
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(state.selectedFlight);
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'high'>('all');

  const filteredFlights = mockFlights.filter((f) => {
    if (priceFilter === 'low') return f.price < 3500000;
    if (priceFilter === 'high') return f.price >= 3500000;
    return true;
  });

  const handleSelectFlight = (flight: FlightData) => {
    setSelectedFlight(flight);
    dispatch({ type: 'SELECT_FLIGHT', payload: flight });
  };

  const handleContinue = () => {
    if (selectedFlight) {
      navigate('/passenger');
    }
  };

  const departureDateFormatted = state.searchData?.departureDate
    ? (state.searchData.departureDate instanceof Date
        ? state.searchData.departureDate.toLocaleDateString()
        : String(state.searchData.departureDate))
    : '2026-06-15';

  const routeLabel = state.searchData?.origin && state.searchData?.destination
    ? `${state.searchData.origin.city} (${state.searchData.origin.code}) → ${state.searchData.destination.city} (${state.searchData.destination.code})`
    : 'Hanoi (HAN) → Ho Chi Minh City (SGN)';

  return (
    <BookingLayout currentStep={0}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-headline-lg text-primary">
            Select Your Flight
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            {routeLabel} · {departureDateFormatted}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Chip
            selected={priceFilter === 'all'}
            onClick={() => setPriceFilter('all')}
          >
            All Prices
          </Chip>
          <Chip
            selected={priceFilter === 'low'}
            onClick={() => setPriceFilter('low')}
          >
            Under 3.5M
          </Chip>
          <Chip
            selected={priceFilter === 'high'}
            onClick={() => setPriceFilter('high')}
          >
            3.5M+
          </Chip>
        </div>

        {/* Flight List */}
        <div className="space-y-4">
          {filteredFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onSelect={handleSelectFlight}
              selected={selectedFlight?.id === flight.id}
            />
          ))}
        </div>

        {/* Continue Button */}
        {selectedFlight && (
          <div className="fixed bottom-24 right-6 z-30">
            <button
              onClick={handleContinue}
              className="bg-secondary text-on-secondary font-label-lg px-8 py-4 rounded-lg shadow-lg flex items-center gap-2 hover:bg-secondary-container transition-all"
            >
              <span>Continue to Passenger Info</span>
              <Icon name="arrow_forward" size={18} />
            </button>
          </div>
        )}
      </div>
    </BookingLayout>
  );
}
