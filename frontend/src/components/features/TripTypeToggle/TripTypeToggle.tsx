export type TripType = 'roundtrip' | 'oneway' | 'multicity';

export interface TripTypeToggleProps {
  value: TripType;
  onChange: (tripType: TripType) => void;
  className?: string;
}

export const tripTypes: { value: TripType; label: string }[] = [
  { value: 'roundtrip', label: 'Round Trip' },
  { value: 'oneway', label: 'One Way' },
  { value: 'multicity', label: 'Multi-City' },
];

export function TripTypeToggle({ value, onChange, className = '' }: TripTypeToggleProps) {
  return (
    <div className={`inline-flex p-1 bg-surface-container-high/70 rounded-xl shadow-sm ${className}`.trim()}>
      {tripTypes.map((trip) => {
        const isActive = value === trip.value;
        return (
          <button
            key={trip.value}
            type="button"
            onClick={() => onChange(trip.value)}
            className={`
              px-space-lg py-space-xs rounded-lg font-label-lg transition-all
              ${isActive
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
              }
            `}
          >
            {trip.label}
          </button>
        );
      })}
    </div>
  );
}
