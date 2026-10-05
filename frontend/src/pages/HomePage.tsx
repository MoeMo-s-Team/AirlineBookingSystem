import { useState, useMemo } from 'react';
import {
  Header,
  SearchConsole,
  FlightCard,
  ServiceCard,
  BookingSummary,
  ProgressStepper,
  ETicket,
  StatusBadge,
  RouteDisplay,
  PriceDisplay,
  PassengerCard,
  CountdownTimer,
  type Airport,
  type FlightData,
  type ServiceData,
  type SearchFormData,
  type Step,
  type ETicketData,
  type SummaryItem,
} from '@/components/features';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';

const mockAirports: Airport[] = [
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', countryCode: 'VN' },
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN' },
  { code: 'DAD', name: 'Da Nang International Airport', city: 'Da Nang', country: 'Vietnam', countryCode: 'VN' },
  { code: 'CXR', name: 'Cam Ranh International Airport', city: 'Nha Trang', country: 'Vietnam', countryCode: 'VN' },
  { code: 'PQC', name: 'Phu Quoc International Airport', city: 'Phu Quoc', country: 'Vietnam', countryCode: 'VN' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', countryCode: 'TH' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', countryCode: 'SG' },
];

const initialFlights: FlightData[] = [
  {
    id: 'fl-1',
    flightNumber: 'SW-101',
    airline: 'SkyWing Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    departure: { airport: 'HAN', time: '07:30', date: '2026-10-15' },
    arrival: { airport: 'SGN', time: '09:45', date: '2026-10-15' },
    duration: '2h 15m',
    stops: 0,
    price: 2450000,
    cabinClass: 'economy',
    seatsAvailable: 8,
  },
  {
    id: 'fl-2',
    flightNumber: 'SW-205',
    airline: 'SkyWing Airlines',
    aircraft: 'Airbus A350-900',
    departure: { airport: 'HAN', time: '11:15', date: '2026-10-15' },
    arrival: { airport: 'SGN', time: '13:30', date: '2026-10-15' },
    duration: '2h 15m',
    stops: 0,
    price: 2890000,
    cabinClass: 'premium',
    seatsAvailable: 4,
  },
  {
    id: 'fl-3',
    flightNumber: 'SW-509',
    airline: 'SkyWing Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    departure: { airport: 'HAN', time: '17:00', date: '2026-10-15' },
    arrival: { airport: 'SGN', time: '19:15', date: '2026-10-15' },
    duration: '2h 15m',
    stops: 0,
    price: 4950000,
    cabinClass: 'business',
    seatsAvailable: 2,
  },
];

const availableServices: ServiceData[] = [
  {
    id: 'svc-1',
    name: 'Extra Baggage (20kg)',
    description: 'Add 20kg checked baggage with priority handling tag.',
    price: 450000,
    icon: 'luggage',
    category: 'baggage',
  },
  {
    id: 'svc-2',
    name: 'Priority Boarding & Check-in',
    description: 'Fast-track security line and skip the gate boarding queue.',
    price: 180000,
    icon: 'speed',
    category: 'priority',
  },
  {
    id: 'svc-3',
    name: 'Lotus Gourmet In-Flight Meal',
    description: 'Premium Vietnamese Pho or Pan-seared Salmon with wine.',
    price: 250000,
    icon: 'restaurant',
    category: 'meal',
  },
  {
    id: 'svc-4',
    name: 'Extra Legroom Window Seat (12A)',
    description: 'Spacious exit row seat with 50% extra legroom and scenic view.',
    price: 220000,
    icon: 'airline_seat_legroom_extra',
    category: 'seat',
  },
  {
    id: 'svc-5',
    name: 'SkyCare Travel Insurance',
    description: 'Full trip delay, cancellation, and medical emergency protection.',
    price: 150000,
    icon: 'health_and_safety',
    category: 'insurance',
  },
];

const bookingSteps: Step[] = [
  { id: '1', label: '1. Select Flight' },
  { id: '2', label: '2. Add-ons' },
  { id: '3', label: '3. Review & Hold' },
  { id: '4', label: '4. E-Ticket' },
];

export function HomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'flow' | 'gallery'>('flow');

  // Booking Flow State
  const [flights] = useState<FlightData[]>(initialFlights);
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(initialFlights[0]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['svc-1']);
  const [lastSearchParams, setLastSearchParams] = useState<SearchFormData | null>(null);

  // Hold timer: 10 minutes from now
  const holdEndTime = useMemo(() => new Date(Date.now() + 10 * 60 * 1000), []);

  const handleSearch = (data: SearchFormData) => {
    setLastSearchParams(data);
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Price calculations
  const basePrice = selectedFlight ? selectedFlight.price : 0;
  const chosenServices = availableServices.filter((s) => selectedServiceIds.includes(s.id));
  const addonsTotal = chosenServices.reduce((acc, curr) => acc + curr.price, 0);
  const airportTax = 220000;
  const grandTotal = basePrice + addonsTotal + airportTax;

  const summaryItems: SummaryItem[] = [
    {
      label: selectedFlight ? `${selectedFlight.flightNumber} Base Fare (${selectedFlight.cabinClass.toUpperCase()})` : 'Base Fare',
      value: basePrice,
      type: 'base',
    },
    ...chosenServices.map((s) => ({
      label: s.name,
      value: s.price,
      type: 'addon' as const,
    })),
    {
      label: 'Airport Taxes & Security Surcharges',
      value: airportTax,
      type: 'tax',
    },
  ];

  const primaryPassenger = {
    id: 'p-1',
    name: 'Nguyen Van A',
    type: 'adult' as const,
    tier: 'Gold' as const,
    email: 'nguyen.vana@skywing.vn',
    phone: '+84 901 234 567',
  };

  const eTicketData: ETicketData = {
    bookingRef: 'SW-894721',
    ticketNumber: '738-2849102847',
    flight: {
      number: selectedFlight?.flightNumber || 'SW-101',
      airline: selectedFlight?.airline || 'SkyWing Airlines',
      aircraft: selectedFlight?.aircraft || 'Boeing 787-9 Dreamliner',
      departure: {
        airport: selectedFlight?.departure.airport || 'HAN',
        city: 'Hanoi',
        time: selectedFlight?.departure.time || '07:30',
        date: selectedFlight?.departure.date || '2026-10-15',
        terminal: 'T1',
      },
      arrival: {
        airport: selectedFlight?.arrival.airport || 'SGN',
        city: 'Ho Chi Minh City',
        time: selectedFlight?.arrival.time || '09:45',
        terminal: 'T2',
      },
      duration: selectedFlight?.duration || '2h 15m',
      cabinClass: selectedFlight?.cabinClass ? (selectedFlight.cabinClass.charAt(0).toUpperCase() + selectedFlight.cabinClass.slice(1)) : 'Economy',
    },
    passenger: {
      name: primaryPassenger.name,
      type: 'Adult',
      seat: '12A',
      tier: 'Gold',
    },
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest/60 text-on-surface">
      {/* 1. Header Composite Component */}
      <Header
        user={{
          name: 'Nguyen Van A',
          tier: 'Gold',
        }}
        activeNav="book-flight"
        onNotificationClick={() => alert('Notifications clicked')}
      />

      {/* Main Container with Top Padding for Fixed Header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Test Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                Phase 3 End-User Test Playground
              </h1>
              <StatusBadge status="confirmed" />
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Test full-flow booking interactions with all 18 Phase 3 composite components.
            </p>
          </div>

          <div className="inline-flex p-1 bg-surface-container-high rounded-xl shadow-sm self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('flow')}
              className={`px-4 py-1.5 rounded-lg font-label-md font-semibold transition-all ${
                activeTab === 'flow' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Interactive Booking Flow
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-1.5 rounded-lg font-label-md font-semibold transition-all ${
                activeTab === 'gallery' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Component Gallery
            </button>
          </div>
        </div>

        {activeTab === 'flow' ? (
          <div>
            {/* Interactive Progress Stepper */}
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant mb-8 overflow-x-auto">
              <ProgressStepper
                steps={bookingSteps}
                currentStep={currentStep}
                onStepClick={(index) => setCurrentStep(index)}
              />
            </div>

            {/* STEP 0: Select Flight & Search */}
            {currentStep === 0 && (
              <div className="space-y-8">
                {/* Search Console */}
                <section>
                  <h2 className="text-lg font-semibold text-primary mb-3">1. Search & Filter Flights</h2>
                  <SearchConsole
                    airports={mockAirports}
                    initialValues={{
                      origin: mockAirports[0],
                      destination: mockAirports[1],
                      passengers: { adults: 1, children: 0, infants: 0 },
                    }}
                    onSearch={handleSearch}
                  />
                  {lastSearchParams && (
                    <div className="mt-3 p-3 bg-surface-container-low rounded-lg text-body-sm text-on-surface-variant">
                      ✓ Search triggered: {lastSearchParams.origin?.city} ({lastSearchParams.origin?.code}) → {lastSearchParams.destination?.city} ({lastSearchParams.destination?.code}), {lastSearchParams.tripType}, {lastSearchParams.passengers.adults} adult(s).
                    </div>
                  )}
                </section>

                {/* Flight Results */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-primary">Available Outbound Flights</h2>
                      <p className="text-body-sm text-on-surface-variant">Showing flights with instant confirmation</p>
                    </div>
                    <RouteDisplay
                      origin={{ code: 'HAN', city: 'Hanoi' }}
                      destination={{ code: 'SGN', city: 'Ho Chi Minh City' }}
                    />
                  </div>

                  <div className="space-y-4">
                    {flights.map((flight) => (
                      <FlightCard
                        key={flight.id}
                        flight={flight}
                        selected={selectedFlight?.id === flight.id}
                        onSelect={(fl) => setSelectedFlight(fl)}
                      />
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={!selectedFlight}
                      onClick={() => setCurrentStep(1)}
                    >
                      Continue to Add-on Services →
                    </Button>
                  </div>
                </section>
              </div>
            )}

            {/* STEP 1: Add-ons */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-primary">Customise Your Journey</h2>
                    <p className="text-body-sm text-on-surface-variant">
                      Select optional services to enhance your flight experience. Click any card to add/remove.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableServices.map((svc) => (
                      <ServiceCard
                        key={svc.id}
                        service={svc}
                        selected={selectedServiceIds.includes(svc.id)}
                        onToggle={() => toggleService(svc.id)}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="secondary" onClick={() => setCurrentStep(0)}>
                      ← Back to Flights
                    </Button>
                    <Button variant="primary" size="lg" onClick={() => setCurrentStep(2)}>
                      Proceed to Review & Hold →
                    </Button>
                  </div>
                </div>

                {/* Right Sticky Summary */}
                <div className="lg:col-span-4 sticky top-28">
                  <BookingSummary
                    items={summaryItems}
                    grandTotal={grandTotal}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Review & Seat Hold */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                  {/* Reservation Notice & Countdown */}
                  <Card variant="outlined" padding="md" className="border-secondary/30 bg-surface-container-lowest">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="font-label-sm uppercase tracking-wider text-secondary font-bold block">
                          Seats Held Exclusively For You
                        </span>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">
                          Prices and seat allocations are reserved during this window.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg">
                        <span className="text-body-sm text-on-surface">Time remaining:</span>
                        <CountdownTimer
                          endTime={holdEndTime}
                          onExpire={() => alert('Hold expired! Starting fresh reservation.')}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Flight & Passenger Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-primary">Passenger Information</h3>
                    <PassengerCard
                      passenger={primaryPassenger}
                      isPrimary={true}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-primary">Flight Confirmation</h3>
                      <StatusBadge status="pending" />
                    </div>
                    {selectedFlight && (
                      <FlightCard
                        flight={selectedFlight}
                        selected={true}
                        onSelect={() => {}}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                      ← Back to Services
                    </Button>
                    <Button variant="primary" size="lg" onClick={() => setCurrentStep(3)}>
                      Confirm Booking & Issue E-Ticket →
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-4 sticky top-28">
                  <BookingSummary
                    items={summaryItems}
                    grandTotal={grandTotal}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: E-Ticket Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <ETicket
                  ticket={eTicketData}
                  onPrint={() => window.print()}
                />

                <div className="flex justify-center gap-4">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setCurrentStep(0);
                      setSelectedServiceIds(['svc-1']);
                    }}
                  >
                    Start New Booking Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Component Gallery Mode */
          <div className="space-y-12">
            {/* Status Badges */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-primary">StatusBadge (5 variants)</h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="confirmed" />
                <StatusBadge status="pending" />
                <StatusBadge status="cancelled" />
                <StatusBadge status="completed" />
                <StatusBadge status="check_in" />
              </div>
            </section>

            {/* Price Displays */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-primary">PriceDisplay (sm, md, lg)</h3>
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <span className="text-xs text-on-surface-variant block mb-1">Small (sm):</span>
                  <PriceDisplay price={450000} size="sm" />
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block mb-1">Medium (md):</span>
                  <PriceDisplay price={2450000} size="md" />
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block mb-1">Large (lg):</span>
                  <PriceDisplay price={15800000} size="lg" />
                </div>
              </div>
            </section>

            {/* Route Displays */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-primary">RouteDisplay (horizontal vs vertical)</h3>
              <div className="flex flex-col md:flex-row items-start gap-8">
                <Card variant="outlined" padding="md">
                  <span className="text-xs text-on-surface-variant block mb-2">Horizontal:</span>
                  <RouteDisplay
                    origin={{ code: 'HAN', city: 'Hanoi' }}
                    destination={{ code: 'SGN', city: 'Ho Chi Minh City' }}
                    direction="horizontal"
                  />
                </Card>
                <Card variant="outlined" padding="md">
                  <span className="text-xs text-on-surface-variant block mb-2">Vertical:</span>
                  <RouteDisplay
                    origin={{ code: 'HAN', city: 'Hanoi' }}
                    destination={{ code: 'SGN', city: 'Ho Chi Minh City' }}
                    direction="vertical"
                  />
                </Card>
              </div>
            </section>

            {/* Countdown Timer */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-primary">CountdownTimer</h3>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-on-surface-variant block mb-1">Normal (&gt;60s):</span>
                  <CountdownTimer endTime={new Date(Date.now() + 180 * 1000)} />
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block mb-1">Urgent (&lt;60s red text):</span>
                  <CountdownTimer endTime={new Date(Date.now() + 45 * 1000)} />
                </div>
              </div>
            </section>

            {/* Passenger Card */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-primary">PassengerCard</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PassengerCard
                  passenger={primaryPassenger}
                  isPrimary={true}
                />
                <PassengerCard
                  passenger={{
                    id: 'p-2',
                    name: 'Tran Thi B',
                    type: 'child',
                    tier: 'Silver',
                  }}
                  isPrimary={false}
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
