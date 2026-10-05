import React from 'react';
import { FareClass } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

export interface FareTierCardProps {
  readonly fareClass: FareClass;
  readonly isSelected?: boolean;
  readonly onSelect: (fareClass: FareClass) => void;
}

export const FareTierCard: React.FC<FareTierCardProps> = ({
  fareClass,
  isSelected = false,
  onSelect
}) => {
  const benefits = [
    { icon: 'luggage', label: fareClass.baggage },
    { icon: 'airline_seat_recline_normal', label: fareClass.seatPitch },
    { icon: 'restaurant', label: fareClass.meal },
    { icon: 'sync', label: fareClass.changes },
    { icon: 'stars', label: `${fareClass.milesMultiplier}x SkyWing Miles Accumulation` }
  ];

  return (
    <div
      className={`flex min-w-0 flex-col justify-between rounded-xl border p-5 transition-[background-color,border-color,box-shadow] duration-200 ${
        isSelected
          ? 'bg-surface-container-low border-primary ring-2 ring-primary/20 shadow-md'
          : 'bg-surface-container-lowest border-outline-variant hover:border-secondary hover:shadow-sm'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              {fareClass.tier}
            </span>
            <h4 className="mt-0.5 text-headline-sm font-bold text-primary">
              {fareClass.name}
            </h4>
          </div>
          {fareClass.popular && (
            <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-on-secondary shadow-sm">
              Best Value
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums">
          <span className="text-headline-lg font-bold leading-none text-primary">
            {formatCurrency(fareClass.price)}
          </span>
          <span className="whitespace-nowrap text-[11px] text-on-surface-variant">/ passenger</span>
        </div>

        {/* Feature List */}
        <ul className="mt-5 space-y-3 border-t border-outline-variant/60 pt-4 text-body-sm leading-5 text-on-surface">
          {benefits.map(benefit => (
            <li key={benefit.icon} className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 text-[16px] leading-none text-secondary">
                {benefit.icon}
              </span>
              <span>{benefit.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Select CTA */}
      <div className="mt-6 pt-4 border-t border-outline-variant/60">
        <button
          type="button"
          onClick={() => onSelect(fareClass)}
          aria-pressed={isSelected}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-label-md font-bold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-px ${
            isSelected
              ? 'bg-primary text-on-primary shadow-sm'
              : 'border border-primary text-primary hover:bg-surface-container'
          }`}
        >
          {isSelected ? (
            <>
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Selected Tier</span>
            </>
          ) : (
            <span>Select {fareClass.tier}</span>
          )}
        </button>
      </div>
    </div>
  );
};
