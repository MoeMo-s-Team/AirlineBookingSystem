import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { FlightSearchForm } from '../components/flight/FlightSearchForm';
import { useBookingFlow } from '../hooks/useBookingFlow';

export interface SearchFlightPageProps {
  readonly onSearchSubmitted?: () => void;
}

export const SearchFlightPage: React.FC<SearchFlightPageProps> = () => {
  const navigate = useNavigate();
  const { searchParams, setSearchParams } = useBookingFlow();

  const handleSearch = () => {
    const query = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: searchParams.departureDate,
      passengers: String(searchParams.passengers),
      cabinClass: searchParams.cabinClass
    });
    navigate(`/flights?${query.toString()}`);
  };

  const featuredDestinations = [
    {
      city: 'Hanoi',
      code: 'HAN',
      airport: 'Noi Bai International Airport',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
      price: 140,
      aircraft: 'Airbus A350-900',
      tag: 'Most Popular'
    },
    {
      city: 'Da Nang',
      code: 'DAD',
      airport: 'Da Nang International Airport',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80',
      price: 110,
      aircraft: 'Airbus A321neo LR',
      tag: 'Coastal Escape'
    },
    {
      city: 'Phu Quoc',
      code: 'PQC',
      airport: 'Phu Quoc International Airport',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80',
      price: 95,
      aircraft: 'Boeing 787-10',
      tag: 'Tropical Island'
    }
  ] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        {/* Top Hero Visual Zone */}
        <section className="relative w-full bg-surface-container-low pt-16 pb-28 px-6 lg:px-12 overflow-hidden">
          {/* Atmospheric Ambient Vectors */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
            <svg className="absolute top-0 right-0 w-[800px] h-[480px] -mr-32 -mt-16 text-secondary-fixed-dim" fill="none" viewBox="0 0 800 480">
              <path d="M-50 420C210 400 380 260 520 180C660 100 740 40 850 -20" stroke="currentColor" strokeDasharray="6 6" strokeWidth="2" />
              <path d="M120 480C340 420 510 290 640 190C770 90 820 40 920 -10" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="520" cy="180" fill="#0061a4" r="5" />
              <circle cx="640" cy="190" fill="#33a0fd" r="4" />
            </svg>
            <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-secondary-fixed/40 blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
            {/* Mini Brand Fleet Badge */}
            <div className="inline-flex items-center gap-space-xs px-space-md py-1 mb-space-md rounded-full bg-surface-container text-primary text-label-md shadow-sm border border-outline-variant/60">
              <span className="material-symbols-outlined text-[16px] text-secondary">flight_takeoff</span>
              <span className="tracking-wide font-semibold">SKYBUS A350 & BOEING 787 FLEET DEPLOYED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
              <span className="text-on-surface-variant font-medium">99.4% On-Time Index</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-display-hero text-primary tracking-tight font-bold max-w-4xl">
              Search and Book Flights Across Classes
            </h1>
            <p className="mt-space-sm text-body-lg text-on-surface-variant max-w-2xl">
              Experience seamless journeys with premium comfort, transparent fares, and precision scheduled departures.
            </p>
          </div>
        </section>

        {/* Flight Booking Search Console Layer */}
        <section className="relative max-w-6xl w-full mx-auto px-6 -mt-20 z-20">
          <FlightSearchForm
            searchParams={searchParams}
            onChange={setSearchParams}
            onSearch={handleSearch}
          />
        </section>

        {/* Featured Routes Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-widest block">
                Top Flight Routes
              </span>
              <h2 className="text-headline-lg font-bold text-primary tracking-tight mt-1">
                Featured Departures from Ho Chi Minh City
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/flights')}
              className="text-label-lg font-semibold text-primary hover:text-secondary flex items-center gap-1 transition-colors"
            >
              <span>Explore All Destinations</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDestinations.map(dest => (
              <div
                key={dest.code}
                onClick={() => {
                  setSearchParams({
                    ...searchParams,
                    origin: 'SGN', // Reset to departure city
                    destination: dest.code
                  });
                  const query = new URLSearchParams({
                    origin: 'SGN',
                    destination: dest.code,
                    date: searchParams.departureDate,
                    passengers: String(searchParams.passengers),
                    cabinClass: searchParams.cabinClass
                  });
                  navigate(`/flights?${query.toString()}`);
                }}
                className="group cursor-pointer bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-primary text-[11px] font-bold uppercase tracking-wider backdrop-blur">
                    {dest.tag}
                  </span>
                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="text-2xl font-bold block">{dest.city}</span>
                    <span className="text-xs opacity-90">{dest.code} • {dest.airport}</span>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between bg-surface-container-lowest">
                  <div>
                    <span className="text-[11px] text-on-surface-variant block">Direct flight with {dest.aircraft}</span>
                    <span className="text-label-sm font-semibold text-secondary">Daily Non-stop</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-on-surface-variant block uppercase font-medium">From</span>
                    <span className="text-headline-sm font-bold text-primary">${dest.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Precision Airway Standards Pillar */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 mt-24">
          <div className="bg-surface-container-low rounded-3xl p-8 lg:p-12 border border-outline-variant">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-widest block">
                The SkyWing Standard
              </span>
              <h2 className="text-headline-lg font-bold text-primary tracking-tight mt-1">
                Aero Minimalist Engineering for Travelers
              </h2>
              <p className="text-body-md text-on-surface-variant mt-2">
                Every detail calibrated for operational precision, quiet cabins, and effortless air travel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-[26px]">speed</span>
                </div>
                <h3 className="text-headline-sm font-bold text-primary mb-2">
                  99.4% On-Time Reliability
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Optimized flight turnaround times and modern twin-aisle jets ensure you reach your destination punctually.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-[26px]">airline_seat_flat</span>
                </div>
                <h3 className="text-headline-sm font-bold text-primary mb-2">
                  Full Lie-Flat SkySuites
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  Direct aisle access, sliding privacy doors, and 180-degree lie-flat beds on all long-haul and trunk routes.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-[26px]">credit_card</span>
                </div>
                <h3 className="text-headline-sm font-bold text-primary mb-2">
                  Transparent All-In Pricing
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  No hidden credit card processing surcharges. All government taxes, airport fees, and baggage policies clearly stated.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
