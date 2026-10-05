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
  return (
    <div
      className={`relative flex flex-col justify-between p-5 rounded-xl border transition-all ${
        isSelected
          ? 'bg-surface-container-low border-primary ring-2 ring-primary/20 shadow-md'
          : 'bg-surface-container-lowest border-outline-variant hover:border-secondary hover:shadow-sm'
      }`}
    >
      {fareClass.popular && (
        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[11px] font-bold uppercase tracking-wider shadow-sm">
          Best Value
        </span>
      )}

      <div>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              {fareClass.tier}
            </span>
            <h4 className="text-headline-sm font-bold text-primary mt-0.5">
              {fareClass.name}
            </h4>
          </div>
          <div className="text-right">
            <span className="text-headline-sm font-bold text-primary">
              {formatCurrency(fareClass.price)}
            </span>
            <span className="text-[11px] text-on-surface-variant block">/ passenger</span>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-4 space-y-2.5 border-t border-outline-variant/60 pt-4 text-body-sm text-on-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">luggage</span>
            <span>{fareClass.baggage}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">airline_seat_recline_normal</span>
            <span>{fareClass.seatPitch}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">restaurant</span>
            <span>{fareClass.meal}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">sync</span>
            <span>{fareClass.changes}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">stars</span>
            <span>{fareClass.milesMultiplier}x SkyWing Miles Accumulation</span>
          </div>
        </div>
      </div>

      {/* Select CTA */}
      <div className="mt-6 pt-4 border-t border-outline-variant/60">
        <button
          type="button"
          onClick={() => onSelect(fareClass)}
          className={`w-full py-2.5 rounded-lg text-label-md font-bold transition-all flex items-center justify-center gap-2 ${
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
