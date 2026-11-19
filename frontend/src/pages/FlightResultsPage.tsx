import { getLocale, localize, useLanguage } from '../i18n/index';
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { FlightCard } from '../components/flight/FlightCard';
import { FlightDetailsModal } from '../components/flight/FlightDetailsModal';
import { useFlights } from '../hooks/useFlights';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { useAuth } from '../context/AuthContext';
import { AIRPORTS } from '../data/mockData';
import { formatCurrency } from '../utils/formatCurrency';
import type { BookingFlightSelection, BookingFareOption } from '../types/bookingFlow';

export interface FlightResultsPageProps {
  readonly initialOrigin?: string;
  readonly initialDestination?: string;
}

export const FlightResultsPage: React.FC<FlightResultsPageProps> = () => {
  useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [urlSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const {
    searchParams: defaultSearchParams,
    setSearchParams: setBookingSearchParams,
    selectedFlight,
    setSelectedFlight,
    selectedFareClass,
    setSelectedFareClass,
    selectedReturnFlight,
    setSelectedReturnFlight,
    selectedReturnFareClass,
    setSelectedReturnFareClass,
  } = useBookingFlow();
  const [leg, setLeg] = useState<'outbound' | 'return'>('outbound');

  const activeSearchParams = useMemo(() => ({
    ...defaultSearchParams,
    origin: urlSearchParams.get('origin') ?? defaultSearchParams.origin,
    destination: urlSearchParams.get('destination') ?? defaultSearchParams.destination,
    departureDate: urlSearchParams.get('date') ?? defaultSearchParams.departureDate,
    tripType: (urlSearchParams.get('tripType') ?? defaultSearchParams.tripType) as typeof defaultSearchParams.tripType,
    returnDate: urlSearchParams.get('returnDate') ?? defaultSearchParams.returnDate,
    passengers: Number(urlSearchParams.get('passengers')) || defaultSearchParams.passengers,
    cabinClass: (urlSearchParams.get('cabinClass') as typeof defaultSearchParams.cabinClass | null)
      ?? defaultSearchParams.cabinClass
  }), [defaultSearchParams, urlSearchParams]);
  const roundTrip = activeSearchParams.tripType === 'round-trip';
  const isReturnLeg = roundTrip && leg === 'return';
  const legSearchParams = isReturnLeg ? {
    ...activeSearchParams, tripType: 'one-way' as const,
    origin: activeSearchParams.destination, destination: activeSearchParams.origin,
    departureDate: activeSearchParams.returnDate ?? activeSearchParams.departureDate,
  } : activeSearchParams;
  const {
    filteredFlights,
    nearbyDates,
    seatShortage,
    filters,
    updateFilter,
    maxAvailablePrice,
    isLoading,
    error
  } = useFlights(legSearchParams, isReturnLeg ? selectedFlight?.arrivalAt : undefined,
    roundTrip && !isReturnLeg ? activeSearchParams.returnDate : undefined);

  const [modalFlight, setModalFlight] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const originAirport = AIRPORTS.find(airport => airport.code === legSearchParams.origin);
  const destinationAirport = AIRPORTS.find(airport => airport.code === legSearchParams.destination);
  const departureDate = new Date(`${legSearchParams.departureDate}T00:00:00`);
  const departureDateLabel = Number.isNaN(departureDate.getTime())
    ? 'Invalid departure date'
    : new Intl.DateTimeFormat(getLocale(), {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(departureDate);

  const handleSelectFare = (flight: BookingFlightSelection, fareClass: BookingFareOption) => {
    if (!isAuthenticated) {
      const returnTo = location.pathname + location.search;
      navigate(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    setBookingSearchParams(activeSearchParams);
    if (isReturnLeg) {
      setSelectedReturnFlight(flight);
      setSelectedReturnFareClass(fareClass);
    } else {
      setSelectedFlight(flight);
      setSelectedFareClass(fareClass);
      setSelectedReturnFlight(null);
      setSelectedReturnFareClass(null);
      if (roundTrip) setLeg('return');
    }
  };

  const handleProceed = () => {
    if (selectedFlight && selectedFareClass && (!roundTrip || (selectedReturnFlight && selectedReturnFareClass))) {
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
                    {localize(originAirport?.city ?? legSearchParams.origin)} ({localize(legSearchParams.origin)}) →{localize(' ')}
                    {localize(destinationAirport?.city ?? legSearchParams.destination)} ({localize(legSearchParams.destination)})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mt-0.5">
                  <span>{localize(departureDateLabel)}</span>
                  <span>•</span>
                  <span>{localize(`${activeSearchParams.passengers} ${activeSearchParams.passengers === 1 ? 'passenger' : 'passengers'}`)}</span>
                  <span>•</span>
                  <span>{localize("Economy / Premium / Business")}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-label-md font-semibold text-primary transition-colors flex items-center gap-1.5 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>{localize("Modify Search")}</span>
            </button>
          </div>
        </section>

        {/* Content Area with Filters & Flight List */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          {roundTrip && (
            <div className="mb-6 rounded-xl border border-outline-variant p-4 flex flex-wrap items-center gap-4">
              <strong className="text-primary">{localize(isReturnLeg ? 'Choose your return flight' : 'Choose your outbound flight')}</strong>
              {selectedFlight && <span>{localize('Outbound flight')}: {selectedFlight.flightNumber} · {selectedFlight.departureAt?.slice(0, 10)}</span>}
              {isReturnLeg && <button type="button" className="text-secondary underline" onClick={() => setLeg('outbound')}>{localize('Change outbound flight')}</button>}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Filter Sidebar */}
            <aside className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <h3 className="font-headline-sm font-bold text-primary">{localize("Filters")}</h3>
                <button
                  type="button"
                  onClick={() => {
                    updateFilter('maxPrice', Number.MAX_SAFE_INTEGER);
                    updateFilter('stops', 'all');
                    updateFilter('sortBy', 'recommended');
                  }}
                  className="text-label-sm text-secondary hover:underline font-semibold"
                >{localize("Reset ")}</button>
              </div>

              {/* Max Price Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-label-sm font-semibold text-outline uppercase tracking-wider">{localize("Max Price ")}</label>
                  <span className="text-label-md font-bold text-primary">
                    {localize(filters.maxPrice === Number.MAX_SAFE_INTEGER
                      ? formatCurrency(maxAvailablePrice)
                      : formatCurrency(filters.maxPrice))}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxAvailablePrice}
                  step={Math.max(50_000, Math.ceil(maxAvailablePrice / 20 / 50_000) * 50_000)}
                  value={Math.min(filters.maxPrice, maxAvailablePrice)}
                  onChange={e => updateFilter('maxPrice', Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-body-sm text-on-surface-variant mt-1">
                  <span>{localize(formatCurrency(0))}</span>
                  <span>{localize(formatCurrency(maxAvailablePrice))}</span>
                </div>
              </div>

              {/* Flight Stops */}
              <div>
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-2">{localize("Stops ")}</label>
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
                      <span>{localize(option.label)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cabin Experience Checklist */}
              <div className="pt-4 border-t border-outline-variant">
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-2">{localize("Cabin Inclusions ")}</label>
                <div className="space-y-2 text-body-sm text-on-surface">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-primary" />
                    <span>{localize("Free Wi-Fi Fleet")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-primary" />
                    <span>{localize("In-seat USB-C Power")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-primary" />
                    <span>{localize("Hot Meals Included")}</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Right Flight List Area */}
            <div className="lg:col-span-9 space-y-4">
              {/* Sort Bar */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-label-md font-semibold text-on-surface-variant pl-2">
                  {isLoading ? 'Loading available flights…' : (
                    <>{localize("Found ")}<strong className="text-primary">{localize(filteredFlights.length)}{localize(" flights")}</strong>{localize("matching criteria")}</>
                  )}
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-label-sm text-outline uppercase font-semibold mr-2 hidden md:inline">{localize("Sort:")}</span>
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
                      {localize(sortKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flights Cards */}
              <div className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-error/30 bg-error-container/30 p-6 text-on-error-container">
                    <p className="font-semibold">{localize("Unable to load flights")}</p>
                    <p className="mt-1 text-body-sm">{localize(error)}</p>
                  </div>
                )}
                {!isLoading && !error && seatShortage != null && (
                  <div role="status" className="rounded-xl border border-secondary/30 bg-surface-container-low p-6">
                    <p className="font-semibold text-primary">{localize('Not enough seats on the selected date')}</p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {localize(`You selected ${activeSearchParams.passengers} passengers. The most seats available on a single flight is ${seatShortage}. Reduce the number of passengers or choose another date.`)}
                    </p>
                  </div>
                )}
                {!isLoading && !error && nearbyDates.length > 0 && (
                  <div role="status" className="rounded-xl border border-secondary/30 bg-surface-container-low p-6">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                      {localize('Nearby flights available')}
                    </div>
                    <p className="mt-2 text-body-sm text-on-surface-variant">
                      {seatShortage == null && <>{localize('No flights with enough seats on')} {departureDateLabel}. </>}{localize('Choose a nearby date within 3 days to view available flights.')}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {nearbyDates.map(suggestion => (
                        <button key={suggestion.date} type="button"
                          className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-left hover:border-primary transition-colors"
                          onClick={() => {
                            if (!isReturnLeg) {
                              setSelectedFlight(null);
                              setSelectedFareClass(null);
                            }
                            setSelectedReturnFlight(null);
                            setSelectedReturnFareClass(null);
                            const params = new URLSearchParams(urlSearchParams);
                            params.set('origin', activeSearchParams.origin);
                            params.set('destination', activeSearchParams.destination);
                            params.set(isReturnLeg ? 'returnDate' : 'date', suggestion.date);
                            navigate(`${location.pathname}?${params.toString()}`);
                          }}>
                          <span className="block font-semibold text-primary">{new Intl.DateTimeFormat(getLocale(), { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${suggestion.date}T00:00:00`))}</span>
                          <span className="block text-body-sm text-on-surface-variant">{suggestion.count} {localize('flights')} · {localize('From')} {formatCurrency(suggestion.price)} {localize('/ passenger')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {!isLoading && !error && seatShortage == null && nearbyDates.length === 0 && filteredFlights.length === 0 && (
                  <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
                    <span className="material-symbols-outlined text-[36px] text-secondary">travel_explore</span>
                    <p className="mt-2 font-semibold text-primary">{localize("No flights found for this route and date.")}</p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">{localize("Try another departure date or route.")}</p>
                  </div>
                )}
                {filteredFlights.map(flight => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    passengerCount={activeSearchParams.passengers}
                    selectedFareClass={isReturnLeg
                      ? (selectedReturnFlight?.id === flight.id ? selectedReturnFareClass : null)
                      : (selectedFlight?.id === flight.id ? selectedFareClass : null)}
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
                  <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">{localize("Flight Selected: ")}{localize(selectedFlight.flightNumber)} ({localize(selectedFlight.departureCode)} → {localize(selectedFlight.arrivalCode)})
                  </span>
                  <div className="text-headline-sm font-bold text-primary">
                    {localize(selectedFareClass.name)} • {localize(formatCurrency(selectedFareClass.price + (selectedReturnFareClass?.price ?? 0)))} <span className="text-body-sm font-normal text-on-surface-variant">{localize("total per person")}</span>
                  </div>
                  {selectedReturnFlight && <p className="text-body-sm">{localize('Return flight')}: {selectedReturnFlight.flightNumber} · {selectedReturnFlight.departureAt?.slice(0, 10)} · {selectedReturnFareClass?.name}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={roundTrip && (!selectedReturnFlight || !selectedReturnFareClass)}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{localize("Continue to Passenger Details")}</span>
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
