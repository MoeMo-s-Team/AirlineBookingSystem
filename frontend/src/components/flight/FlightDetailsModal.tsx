import React from 'react';
import { Flight } from '../../types';

export interface FlightDetailsModalProps {
  readonly flight: Flight | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const FlightDetailsModal: React.FC<FlightDetailsModalProps> = ({
  flight,
  isOpen,
  onClose
}) => {
  if (!isOpen || !flight) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant">
        {/* Modal Header */}
        <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">flight</span>
            </div>
            <div>
              <h2 className="text-headline-sm font-bold text-primary">
                Flight {flight.flightNumber} Details
              </h2>
              <p className="text-label-sm text-on-surface-variant">
                {flight.airline} • {flight.aircraft}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Flight Route & Timing */}
          <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">
                Flight Schedule & Terminals
              </span>
              <span className="text-label-sm font-semibold px-2 py-0.5 rounded bg-surface-container text-primary">
                {flight.duration} ({flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-label-sm text-outline uppercase tracking-wider block font-semibold">
                  Departure
                </span>
                <span className="text-headline-md font-bold text-primary block mt-1">
                  {flight.departureTime}
                </span>
                <span className="text-body-sm font-semibold text-on-surface block">
                  {flight.departureCity} ({flight.departureCode})
                </span>
                <span className="text-[12px] text-on-surface-variant block">
                  {flight.departureAirport} • Terminal {flight.departureTerminal}
                </span>
              </div>

              <div>
                <span className="text-label-sm text-outline uppercase tracking-wider block font-semibold">
                  Arrival
                </span>
                <span className="text-headline-md font-bold text-primary block mt-1">
                  {flight.arrivalTime}
                </span>
                <span className="text-body-sm font-semibold text-on-surface block">
                  {flight.arrivalCity} ({flight.arrivalCode})
                </span>
                <span className="text-[12px] text-on-surface-variant block">
                  {flight.arrivalAirport} • Terminal {flight.arrivalTerminal}
                </span>
              </div>
            </div>
          </div>

          {/* Aircraft Specifications */}
          <div>
            <h3 className="text-label-lg font-bold text-primary mb-3 uppercase tracking-wider">
              Aircraft Specifications & Cabin Comfort
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Aircraft Model</span>
                <span className="text-label-md font-bold text-primary">{flight.aircraft}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Cabin Layout</span>
                <span className="text-label-md font-bold text-primary">3-3-3 Ergonomic</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Wi-Fi System</span>
                <span className="text-label-md font-bold text-primary">High-Speed Ka-Band</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">In-Seat Power</span>
                <span className="text-label-md font-bold text-primary">USB-C + 110V AC</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Cabin Air Filtration</span>
                <span className="text-label-md font-bold text-primary">HEPA Grade 99.97%</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-[11px] text-on-surface-variant uppercase font-semibold block">Departure Index</span>
                <span className="text-label-md font-bold text-secondary">{flight.onTimeRate} On-Time</span>
              </div>
            </div>
          </div>

          {/* Onboard Amenities */}
          <div>
            <h3 className="text-label-lg font-bold text-primary mb-3 uppercase tracking-wider">
              Included Inflight Amenities
            </h3>
            <div className="space-y-2 text-body-sm text-on-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">tv</span>
                <span>13.3-inch 4K OLED seatback touchscreens with 300+ movies and live television</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">headset</span>
                <span>Active noise-reduction headphones provided across all cabin classes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">soup_kitchen</span>
                <span>Complimentary seasonal culinary dining with barista-crafted coffee and beverages</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
