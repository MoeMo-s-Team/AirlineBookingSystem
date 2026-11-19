import { localize, useLanguage } from '../../i18n/index';
import React from 'react';
import type { Flight, FareClass, AncillaryService } from '../../types';
import type { BookingFlightSelection, BookingFareOption, BookingSelectedService } from '../../types/bookingFlow';
import { formatCurrency } from '../../utils/formatCurrency';
import { serviceDiscount } from '../../utils/serviceBundle';

export interface PriceSummaryCardProps {
  readonly flight: BookingFlightSelection | Flight | null;
  readonly fareClass: BookingFareOption | FareClass | null;
  readonly returnFlight?: BookingFlightSelection | null;
  readonly returnFareClass?: BookingFareOption | null;
  readonly passengerCount?: number;
  readonly selectedServices?: readonly (BookingSelectedService | AncillaryService)[];
  readonly serviceBundle?: boolean;
  readonly ctaLabel?: string;
  readonly onCtaClick?: () => void;
  readonly isCtaDisabled?: boolean;
}

export const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({
  flight,
  fareClass,
  returnFlight,
  returnFareClass,
  passengerCount = 1,
  selectedServices = [],
  serviceBundle = false,
  ctaLabel = 'Proceed to Passenger Info',
  onCtaClick,
  isCtaDisabled = false
}) => {
  useLanguage();
  const flightPrice = fareClass ? fareClass.price : (flight?.basePrice ?? 0);
  const baseTotal = (flightPrice + (returnFareClass?.price ?? 0)) * passengerCount;
  const servicesTotal = selectedServices.reduce((sum, s) => sum + ((s.price || 0) * ((s as any).quantity || 1)), 0);
  const discount = serviceDiscount(selectedServices as readonly BookingSelectedService[], serviceBundle);
  const grandTotal = baseTotal + servicesTotal - discount;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm sticky top-24">
      <h3 className="text-headline-sm font-bold text-primary mb-4 pb-3 border-b border-outline-variant">{localize("Fare & Price Breakdown ")}</h3>

      {flight && (
        <div className="mb-4 pb-4 border-b border-outline-variant text-body-sm">
          <div className="flex items-center justify-between font-bold text-primary">
            <span>{localize(flight.departureCode)} → {localize(flight.arrivalCode)}</span>
            <span>{localize(flight.flightNumber)}</span>
          </div>
          <div className="text-on-surface-variant text-body-sm mt-0.5">
            {localize('Departure time')}: {flight.departureTime} · {localize(fareClass?.name || 'Standard Tier')}
          </div>
        </div>
      )}

      {/* Itemized lines */}
      {returnFlight && (
        <div className="mb-4 pb-4 border-b border-outline-variant text-body-sm">
          <strong className="text-primary">{localize('Return flight')}: {returnFlight.departureCode} → {returnFlight.arrivalCode} · {returnFlight.flightNumber}</strong>
          <p>{returnFlight.departureAt?.slice(0, 10)} · {returnFlight.departureTime} · {localize(returnFareClass?.name)}</p>
          <p className="mt-2 text-on-surface-variant">{localize('Ancillary services are charged once per booking.')}</p>
        </div>
      )}
      <div className="space-y-2.5 text-body-sm">
        <div className="flex items-center justify-between text-on-surface">
          <span>{localize(`Flight Fare (${passengerCount}x Adult)`)}</span>
          <span className="font-semibold text-primary">{localize(formatCurrency(baseTotal))}</span>
        </div>

        {selectedServices.length > 0 && (
          <div className="pt-2 border-t border-dashed border-outline-variant space-y-1.5">
            <span className="text-body-sm font-bold uppercase tracking-wider text-outline block">{localize("Ancillary Add-ons ")}</span>
            {selectedServices.map(service => {
              const qty = (service as any).quantity || 1;
              return (
                <div key={service.id} className="flex items-center justify-between text-on-surface-variant text-body-sm">
                  <span className="truncate pr-2">
                    {localize(service.name)} {localize(qty > 1 ? `(x${qty})` : '')}
                  </span>
                  <span className="font-medium text-primary">+{localize(formatCurrency(service.price * qty))}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Total Due */}
      {discount > 0 && <div className="mt-4 flex justify-between text-secondary font-semibold"><span>{localize('Service bundle discount (15%)')}</span><span>−{formatCurrency(discount)}</span></div>}
      <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
        <div>
          <span className="text-body-sm font-semibold text-on-surface-variant uppercase tracking-wider block">{localize("Total Payable ")}</span>
          <span className="text-headline-lg font-bold text-primary">
            {localize(formatCurrency(grandTotal))}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      {onCtaClick && (
        <button
          type="button"
          onClick={onCtaClick}
          disabled={isCtaDisabled}
          className={`w-full mt-6 py-3.5 rounded-xl font-label-lg text-label-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
            isCtaDisabled
              ? 'bg-outline-variant text-outline cursor-not-allowed'
              : 'bg-primary hover:bg-primary-container text-on-primary hover:shadow-lg'
          }`}
        >
          <span>{localize(ctaLabel)}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      )}
    </div>
  );
};
