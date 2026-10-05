import React, { useState } from 'react';
import { Flight, FareClass } from '../../types';
import { FareTierCard } from './FareTierCard';

export interface FlightCardProps {
  readonly flight: Flight;
  readonly selectedFareClass?: FareClass | null;
  readonly onSelectFare: (flight: Flight, fareClass: FareClass) => void;
  readonly onViewDetails: (flight: Flight) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  selectedFareClass,
  onSelectFare,
  onViewDetails
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top Banner / Card Summary */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Airline and Aircraft Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">flight</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary text-headline-sm">
                  {flight.airline}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-container text-primary">
                  {flight.flightNumber}
                </span>
              </div>
              <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mt-0.5">
                <span>{flight.aircraft}</span>
                <span>•</span>
                <span className="text-secondary font-medium">
                  {flight.onTimeRate} On-Time
                </span>
              </div>
            </div>
          </div>

          {/* Route & Times Visual Block */}
          <div className="flex items-center gap-6 sm:gap-10">
            {/* Departure */}
            <div className="text-left">
              <span className="text-headline-md font-bold text-primary block">
                {flight.departureTime}
              </span>
              <span className="text-label-md font-bold text-on-surface">
                {flight.departureCode}
              </span>
              <span className="text-[11px] text-on-surface-variant block">
                {flight.departureTerminal}
              </span>
            </div>

            {/* Flight Path Graphic */}
            <div className="flex flex-col items-center min-w-[120px] sm:min-w-[160px]">
              <span className="text-[11px] font-semibold text-on-surface-variant mb-1">
                {flight.duration}
              </span>
              <div className="relative w-full flex items-center">
                <div className="w-2 h-2 rounded-full border-2 border-primary bg-surface-container-lowest" />
                <div className="flex-1 h-0.5 bg-outline-variant relative">
                  <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] text-primary rotate-90">
                    flight
                  </span>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-[11px] font-medium text-secondary mt-1">
                {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <span className="text-headline-md font-bold text-primary block">
                {flight.arrivalTime}
              </span>
              <span className="text-label-md font-bold text-on-surface">
                {flight.arrivalCode}
              </span>
              <span className="text-[11px] text-on-surface-variant block">
                {flight.arrivalTerminal}
              </span>
            </div>
          </div>

          {/* Price & Primary CTA */}
          <div className="flex items-center lg:flex-col lg:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-outline-variant">
            <div className="text-left lg:text-right">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block">
                Starting from
              </span>
              <span className="text-headline-lg font-bold text-primary leading-none">
                ${flight.basePrice}
              </span>
              <span className="text-[10px] text-on-surface-variant block mt-0.5">
                includes taxes & fees
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => onViewDetails(flight)}
                className="px-3 py-2 rounded-lg text-label-md font-semibold text-primary hover:bg-surface-container transition-colors"
              >
                Flight Details
              </button>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold transition-all flex items-center gap-1 shadow-sm"
              >
                <span>{expanded ? 'Hide Fares' : 'View Fares'}</span>
                <span className={`material-symbols-outlined text-[16px] transition-transform ${expanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Fares Selection Drawer */}
      {expanded && (
        <div className="bg-surface-container-low/60 border-t border-outline-variant p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-label-lg font-bold text-primary uppercase tracking-wider">
              Select Fare Tier for Flight {flight.flightNumber}
            </h3>
            <span className="text-label-sm text-on-surface-variant">
              {flight.seatsAvailable} seats remaining at this rate
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {flight.fareClasses.map(fc => (
              <FareTierCard
                key={fc.id}
                fareClass={fc}
                isSelected={selectedFareClass?.id === fc.id}
                onSelect={selected => {
                  onSelectFare(flight, selected);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
