import React from 'react';
import type { AncillaryService } from '../../types';
import type { BookingSelectedService } from '../../types/bookingFlow';
import { formatCurrency } from '../../utils/formatCurrency';

export interface ServiceCardProps {
  readonly service: BookingSelectedService | AncillaryService;
  readonly isSelected?: boolean;
  readonly onToggle: (service: any) => void;
}

const getServiceIcon = (type?: string, icon?: string): string => {
  if (icon) return icon;
  switch (type?.toUpperCase()) {
    case 'BAGGAGE':
      return 'luggage';
    case 'MEAL':
      return 'restaurant';
    case 'SEAT':
      return 'airline_seat_recline_normal';
    case 'PRIORITY_BOARDING':
      return 'stars';
    default:
      return 'room_service';
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected = false,
  onToggle
}) => {
  const badge = (service as AncillaryService).badge;
  const description = (service as AncillaryService).description;
  const icon = getServiceIcon((service as BookingSelectedService).type, (service as AncillaryService).icon);

  return (
    <div
      className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all ${
        isSelected
          ? 'bg-surface-container-low border-primary ring-2 ring-primary/20 shadow-md'
          : 'bg-surface-container-lowest border-outline-variant hover:border-secondary hover:shadow-sm'
      }`}
    >
      {badge && (
        <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-bold uppercase tracking-wider">
          {badge}
        </span>
      )}

      <div>
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4">
          <span className="material-symbols-outlined text-[26px]">{icon}</span>
        </div>

        <h3 className="text-headline-sm font-bold text-primary mb-1">
          {service.name}
        </h3>
        {description && (
          <p className="text-body-sm text-on-surface-variant line-clamp-3 mb-4">
            {description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
            Service Rate
          </span>
          <span className="text-headline-sm font-bold text-primary">
            +{formatCurrency(service.price)}
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
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Added</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Service</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
