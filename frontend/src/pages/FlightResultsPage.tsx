import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { FlightCard } from '../components/flight/FlightCard';
import { FlightDetailsModal } from '../components/flight/FlightDetailsModal';
import { useFlights } from '../hooks/useFlights';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { Flight, FareClass } from '../types';

export interface FlightResultsPageProps {
  readonly initialOrigin?: string;
  readonly initialDestination?: string;
}

export const FlightResultsPage: React.FC<FlightResultsPageProps> = () => {
  const navigate = useNavigate();
  const { filteredFlights, filters, updateFilter } = useFlights();
  const { selectedFlight, setSelectedFlight, selectedFareClass, setSelectedFareClass } = useBookingFlow();

  const [modalFlight, setModalFlight] = useState<Flight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectFare = (flight: Flight, fareClass: FareClass) => {
    setSelectedFlight(flight);
    setSelectedFareClass(fareClass);
  };

  const handleProceed = () => {
    if (selectedFlight && selectedFareClass) {
      navigate('/passenger');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        {/* Search Itinerary Banner */}
        <section className="bg-surface-container-low border-b border-outline-variant py-6 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[26px]">connecting_airports</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-headline-md font-bold text-primary">
                    Ho Chi Minh City (SGN) → Hanoi (HAN)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mt-0.5">
                  <span>Thu, Oct 15, 2026</span>
                  <span>•</span>
                  <span>1 Passenger</span>
                  <span>•</span>
                  <span>Economy / Premium / Business</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-label-md font-semibold text-primary transition-colors flex items-center gap-1.5 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Modify Search</span>
            </button>
          </div>
        </section>

        {/* Content Area with Filters & Flight List */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Filter Sidebar */}
            <aside className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <h3 className="font-headline-sm font-bold text-primary">Filters</h3>
                <button
                  type="button"
                  onClick={() => {
                    updateFilter('maxPrice', 500);
                    updateFilter('stops', 'all');
                    updateFilter('sortBy', 'recommended');
                  }}
                  className="text-label-sm text-secondary hover:underline font-semibold"
                >
                  Reset
                </button>
              </div>

              {/* Max Price Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-label-sm font-semibold text-outline uppercase tracking-wider">
                    Max Price
                  </label>
                  <span className="text-label-md font-bold text-primary">
                    ${filters.maxPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="500"
                  step="10"
                  value={filters.maxPrice}
                  onChange={e => updateFilter('maxPrice', Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-on-surface-variant mt-1">
                  <span>$90</span>
                  <span>$500</span>
                </div>
              </div>

              {/* Flight Stops */}
              <div>
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-2">
                  Stops
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Flights' },
                    { id: 'nonstop', label: 'Non-stop Only' },
                    { id: 'one-stop', label: '1 Stop' }
                  ].map(option => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer text-body-sm text-on-surface">
                      <input
                        type="radio"
                        name="stops"
                        checked={filters.stops === option.id}
                        onChange={() => updateFilter('stops', option.id as any)}
                        className="accent-primary"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cabin Experience Checklist */}
              <div className="pt-4 border-t border-outline-variant">
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-2">
                  Cabin Inclusions
                </label>
                <div className="space-y-2 text-body-sm text-on-surface">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-primary" />
                    <span>Free Wi-Fi Fleet</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-primary" />
                    <span>In-seat USB-C Power</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-primary" />
                    <span>Hot Meals Included</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Right Flight List Area */}
            <div className="lg:col-span-9 space-y-4">
              {/* Sort Bar */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-label-md font-semibold text-on-surface-variant pl-2">
                  Found <strong className="text-primary">{filteredFlights.length} flights</strong> matching criteria
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-label-sm text-outline uppercase font-semibold mr-2 hidden md:inline">Sort:</span>
                  {(['recommended', 'cheapest', 'fastest', 'earliest'] as const).map(sortKey => (
                    <button
                      key={sortKey}
                      type="button"
                      onClick={() => updateFilter('sortBy', sortKey)}
                      className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold capitalize transition-all ${
                        filters.sortBy === sortKey
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                      }`}
                    >
                      {sortKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flights Cards */}
              <div className="space-y-4">
                {filteredFlights.map(flight => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    selectedFareClass={selectedFlight?.id === flight.id ? selectedFareClass : null}
                    onSelectFare={handleSelectFare}
                    onViewDetails={f => {
                      setModalFlight(f);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Selected Flight Bottom Floating Action Bar */}
        {selectedFlight && selectedFareClass && (
          <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant shadow-2xl py-4 px-6 lg:px-12 z-40 animate-slideUp">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                </div>
                <div>
                  <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">
                    Flight Selected: {selectedFlight.flightNumber} ({selectedFlight.departureCode} → {selectedFlight.arrivalCode})
                  </span>
                  <div className="text-headline-sm font-bold text-primary">
                    {selectedFareClass.name} • ${selectedFareClass.price} <span className="text-body-sm font-normal text-on-surface-variant">total per person</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Passenger Details</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Flight Details Modal */}
      <FlightDetailsModal
        flight={modalFlight}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
