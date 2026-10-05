import React from 'react';
import { Flight, FareClass, AncillaryService } from '../../types';

export interface PriceSummaryCardProps {
  readonly flight: Flight | null;
  readonly fareClass: FareClass | null;
  readonly passengerCount?: number;
  readonly selectedServices?: readonly AncillaryService[];
  readonly ctaLabel?: string;
  readonly onCtaClick?: () => void;
  readonly isCtaDisabled?: boolean;
}

export const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({
  flight,
  fareClass,
  passengerCount = 1,
  selectedServices = [],
  ctaLabel = 'Proceed to Passenger Info',
  onCtaClick,
  isCtaDisabled = false
}) => {
  const flightPrice = fareClass ? fareClass.price : (flight?.basePrice ?? 0);
  const baseTotal = flightPrice * passengerCount;
  const taxesAndFees = Math.round(baseTotal * 0.12);
  const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const grandTotal = baseTotal + taxesAndFees + servicesTotal;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm sticky top-24">
      <h3 className="text-headline-sm font-bold text-primary mb-4 pb-3 border-b border-outline-variant">
        Fare & Price Breakdown
      </h3>

      {flight && (
        <div className="mb-4 pb-4 border-b border-outline-variant text-body-sm">
          <div className="flex items-center justify-between font-bold text-primary">
            <span>{flight.departureCode} → {flight.arrivalCode}</span>
            <span>{flight.flightNumber}</span>
          </div>
          <div className="text-on-surface-variant text-[12px] mt-0.5">
            {flight.departureTime} Departure • {fareClass?.name || 'Standard Tier'}
          </div>
        </div>
      )}

      {/* Itemized lines */}
      <div className="space-y-2.5 text-body-sm">
        <div className="flex items-center justify-between text-on-surface">
          <span>Flight Fare ({passengerCount}x Adult)</span>
          <span className="font-semibold text-primary">${baseTotal}</span>
        </div>

        <div className="flex items-center justify-between text-on-surface">
          <span>Aviation Taxes & Security Fees</span>
          <span className="font-semibold text-primary">${taxesAndFees}</span>
        </div>

        {selectedServices.length > 0 && (
          <div className="pt-2 border-t border-dashed border-outline-variant space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline block">
              Ancillary Add-ons
            </span>
            {selectedServices.map(service => (
              <div key={service.id} className="flex items-center justify-between text-on-surface-variant text-[13px]">
                <span className="truncate pr-2">{service.name}</span>
                <span className="font-medium text-primary">+${service.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total Due */}
      <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
            Total Payable
          </span>
          <span className="text-headline-lg font-bold text-primary">
            ${grandTotal}
          </span>
        </div>
        <span className="text-[11px] text-secondary font-semibold bg-surface-container px-2 py-1 rounded">
          All Taxes Included
        </span>
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
          <span>{ctaLabel}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      )}
    </div>
  );
};
