import React from 'react';
import { AncillaryService } from '../../types';

export interface ServiceCardProps {
  readonly service: AncillaryService;
  readonly isSelected?: boolean;
  readonly onToggle: (service: AncillaryService) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected = false,
  onToggle
}) => {
  return (
    <div
      className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all ${
        isSelected
          ? 'bg-surface-container-low border-primary ring-2 ring-primary/20 shadow-md'
          : 'bg-surface-container-lowest border-outline-variant hover:border-secondary hover:shadow-sm'
      }`}
    >
      {service.badge && (
        <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-bold uppercase tracking-wider">
          {service.badge}
        </span>
      )}

      <div>
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4">
          <span className="material-symbols-outlined text-[26px]">{service.icon}</span>
        </div>

        <h3 className="text-headline-sm font-bold text-primary mb-1">
          {service.name}
        </h3>
        <p className="text-body-sm text-on-surface-variant line-clamp-3 mb-4">
          {service.description}
        </p>
      </div>

      <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
            Service Rate
          </span>
          <span className="text-headline-sm font-bold text-primary">
            +${service.price}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggle(service)}
          className={`px-5 py-2 rounded-lg text-label-md font-bold transition-all flex items-center gap-1.5 ${
            isSelected
              ? 'bg-primary text-on-primary shadow-sm'
              : 'border border-primary text-primary hover:bg-surface-container'
          }`}
        >
          {isSelected ? (
            <>
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Added</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add to Trip</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
