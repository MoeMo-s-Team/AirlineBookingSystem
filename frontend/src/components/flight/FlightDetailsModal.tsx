import { localize, useLanguage } from '../../i18n/index';
import React from 'react';

export interface FlightDetailsModalProps {
  readonly flight: any | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const FlightDetailsModal: React.FC<FlightDetailsModalProps> = ({
  flight,
  isOpen,
  onClose
}) => {
  useLanguage();
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
              <h2 className="text-headline-sm font-bold text-primary">{localize("Flight ")}{localize(flight.flightNumber)}{localize("Details ")}</h2>
              <p className="text-label-sm text-on-surface-variant">
                {localize(flight.airline)} • {localize(flight.aircraft)}
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
              <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">{localize("Flight Schedule & Terminals ")}</span>
              <span className="text-label-sm font-semibold px-2 py-0.5 rounded bg-surface-container text-primary">
                {localize(flight.duration)} ({localize(flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`)})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-label-sm text-outline uppercase tracking-wider block font-semibold">{localize("Departure ")}</span>
                <span className="text-headline-md font-bold text-primary block mt-1">
                  {localize(flight.departureTime)}
                </span>
                <span className="text-body-sm font-semibold text-on-surface block">
                  {localize(flight.departureCity)} ({localize(flight.departureCode)})
                </span>
                <span className="text-body-sm text-on-surface-variant block">
                  {localize(flight.departureAirport)}{localize("• Terminal ")}{localize(flight.departureTerminal)}
                </span>
              </div>

              <div>
                <span className="text-label-sm text-outline uppercase tracking-wider block font-semibold">{localize("Arrival ")}</span>
                <span className="text-headline-md font-bold text-primary block mt-1">
                  {localize(flight.arrivalTime)}
                </span>
                <span className="text-body-sm font-semibold text-on-surface block">
                  {localize(flight.arrivalCity)} ({localize(flight.arrivalCode)})
                </span>
                <span className="text-body-sm text-on-surface-variant block">
                  {localize(flight.arrivalAirport)}{localize("• Terminal ")}{localize(flight.arrivalTerminal)}
                </span>
              </div>
            </div>
          </div>

          {/* Aircraft Specifications */}
          <div>
            <h3 className="text-label-lg font-bold text-primary mb-3 uppercase tracking-wider">{localize("Aircraft Specifications & Cabin Comfort ")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-body-sm text-on-surface-variant uppercase font-semibold block">{localize("Aircraft Model")}</span>
                <span className="text-label-md font-bold text-primary">{localize(flight.aircraft)}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-body-sm text-on-surface-variant uppercase font-semibold block">{localize("Cabin Layout")}</span>
                <span className="text-label-md font-bold text-primary">{localize("3-3-3 Ergonomic")}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-body-sm text-on-surface-variant uppercase font-semibold block">{localize("Wi-Fi System")}</span>
                <span className="text-label-md font-bold text-primary">{localize("High-Speed Ka-Band")}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-body-sm text-on-surface-variant uppercase font-semibold block">{localize("In-Seat Power")}</span>
                <span className="text-label-md font-bold text-primary">{localize("USB-C + 110V AC")}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-body-sm text-on-surface-variant uppercase font-semibold block">{localize("Cabin Air Filtration")}</span>
                <span className="text-label-md font-bold text-primary">{localize("HEPA Grade 99.97%")}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="text-body-sm text-on-surface-variant uppercase font-semibold block">{localize("Departure Index")}</span>
                <span className="text-label-md font-bold text-secondary">{localize(flight.onTimeRate)}{localize("On-Time")}</span>
              </div>
            </div>
          </div>

          {/* Onboard Amenities */}
          <div>
            <h3 className="text-label-lg font-bold text-primary mb-3 uppercase tracking-wider">{localize("Included Inflight Amenities ")}</h3>
            <div className="space-y-2 text-body-sm text-on-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">tv</span>
                <span>{localize("13.3-inch 4K OLED seatback touchscreens with 300+ movies and live television")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">headset</span>
                <span>{localize("Active noise-reduction headphones provided across all cabin classes")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">soup_kitchen</span>
                <span>{localize("Complimentary seasonal culinary dining with barista-crafted coffee and beverages")}</span>
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
          >{localize("Close Details ")}</button>
        </div>
      </div>
    </div>
  );
};
