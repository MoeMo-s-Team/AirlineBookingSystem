import React from 'react';
import { FlightSearchParams } from '../../types';
import { AIRPORTS } from '../../data/mockData';

export interface FlightSearchFormProps {
  readonly searchParams: FlightSearchParams;
  readonly onChange: (params: FlightSearchParams) => void;
  readonly onSearch: () => void;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  searchParams,
  onChange,
  onSearch
}) => {
  const handleSwapAirports = () => {
    onChange({
      ...searchParams,
      origin: searchParams.destination,
      destination: searchParams.origin
    });
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant p-6 lg:p-8">
      {/* Trip Type Selector Tabs */}
      <div className="inline-flex p-1 mb-6 rounded-xl bg-surface-container-low border border-outline-variant" role="tablist">
        {(['round-trip', 'one-way', 'multi-city'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ ...searchParams, tripType: type })}
            className={`px-5 py-2 rounded-lg text-label-md font-semibold capitalize transition-all ${
              searchParams.tripType === type
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {type.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
        {/* Origin Field */}
        <div className="lg:col-span-3 bg-surface-container-low/70 hover:bg-surface-container-low transition-colors rounded-xl p-4 border border-outline-variant/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-label-sm text-outline uppercase tracking-wider flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[16px] text-secondary">flight_takeoff</span>
              From
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary text-label-sm font-bold">
              {searchParams.origin}
            </span>
          </div>
          <select
            value={searchParams.origin}
            onChange={e => onChange({ ...searchParams, origin: e.target.value })}
            className="w-full bg-transparent text-primary font-bold text-headline-sm focus:outline-none cursor-pointer"
          >
            {AIRPORTS.map(airport => (
              <option key={airport.code} value={airport.code} className="text-body-md text-on-surface">
                {airport.city} ({airport.code})
              </option>
            ))}
          </select>
          <div className="text-label-sm text-on-surface-variant truncate mt-0.5">
            {AIRPORTS.find(a => a.code === searchParams.origin)?.name}
          </div>
        </div>

        {/* Airport Swap Button */}
        <div className="hidden lg:flex lg:col-span-1 justify-center -mx-3 z-10">
          <button
            type="button"
            onClick={handleSwapAirports}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary text-primary border border-outline-variant flex items-center justify-center transition-all shadow-sm"
            title="Swap Origin and Destination"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          </button>
        </div>

        {/* Destination Field */}
        <div className="lg:col-span-3 bg-surface-container-low/70 hover:bg-surface-container-low transition-colors rounded-xl p-4 border border-outline-variant/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-label-sm text-outline uppercase tracking-wider flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[16px] text-secondary">flight_land</span>
              To
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary text-label-sm font-bold">
              {searchParams.destination}
            </span>
          </div>
          <select
            value={searchParams.destination}
            onChange={e => onChange({ ...searchParams, destination: e.target.value })}
            className="w-full bg-transparent text-primary font-bold text-headline-sm focus:outline-none cursor-pointer"
          >
            {AIRPORTS.map(airport => (
              <option key={airport.code} value={airport.code} className="text-body-md text-on-surface">
                {airport.city} ({airport.code})
              </option>
            ))}
          </select>
          <div className="text-label-sm text-on-surface-variant truncate mt-0.5">
            {AIRPORTS.find(a => a.code === searchParams.destination)?.name}
          </div>
        </div>

        {/* Dates Field */}
        <div className="lg:col-span-3 bg-surface-container-low/70 hover:bg-surface-container-low transition-colors rounded-xl p-4 border border-outline-variant/60">
          <div className="text-label-sm text-outline uppercase tracking-wider flex items-center gap-1 font-semibold mb-1">
            <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
            Departure Date
          </div>
          <input
            type="date"
            value={searchParams.departureDate}
            onChange={e => onChange({ ...searchParams, departureDate: e.target.value })}
            className="w-full bg-transparent text-primary font-bold text-headline-sm focus:outline-none cursor-pointer"
          />
          <div className="text-label-sm text-on-surface-variant mt-0.5">
            {searchParams.tripType === 'round-trip' ? 'Return: Oct 22, 2026' : 'One way flight'}
          </div>
        </div>

        {/* Passengers & Class Field */}
        <div className="lg:col-span-2 bg-surface-container-low/70 hover:bg-surface-container-low transition-colors rounded-xl p-4 border border-outline-variant/60">
          <div className="text-label-sm text-outline uppercase tracking-wider flex items-center gap-1 font-semibold mb-1">
            <span className="material-symbols-outlined text-[16px] text-secondary">group</span>
            Cabin & Pax
          </div>
          <select
            value={searchParams.cabinClass}
            onChange={e => onChange({ ...searchParams, cabinClass: e.target.value as any })}
            className="w-full bg-transparent text-primary font-bold text-headline-sm focus:outline-none cursor-pointer"
          >
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Eco</option>
            <option value="Business">Business</option>
          </select>
          <div className="text-label-sm text-on-surface-variant mt-0.5">
            {searchParams.passengers} Adult Passenger
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant">
        <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
          <span>Zero booking fee guarantee & 24h risk-free cancellation</span>
        </div>
        <button
          type="button"
          onClick={onSearch}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          <span>Search SkyWing Flights</span>
        </button>
      </div>
    </div>
  );
};
