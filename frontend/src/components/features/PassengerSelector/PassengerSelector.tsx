import { useState } from 'react';
import { Icon } from '@/components/ui/Icon/Icon';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

export interface PassengerSelectorProps {
  value: PassengerCount;
  onChange: (passengers: PassengerCount) => void;
  label?: string;
}

interface CounterRowProps {
  label: string;
  sublabel: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canDecrement: boolean;
  canIncrement?: boolean;
}

function CounterRow({
  label,
  sublabel,
  value,
  onIncrement,
  onDecrement,
  canDecrement,
  canIncrement = true,
}: CounterRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-label-lg text-on-surface">{label}</p>
        <p className="font-body-sm text-on-surface-variant">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={!canDecrement}
          aria-label={`Decrease ${label}`}
          className="w-8 h-8 rounded-full border border-outline flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container-low transition-colors"
        >
          <span className="text-lg">−</span>
        </button>
        <span className="w-6 text-center font-label-lg font-bold">{value}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={!canIncrement}
          aria-label={`Increase ${label}`}
          className="w-8 h-8 rounded-full border border-outline flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container-low transition-colors"
        >
          <span className="text-lg">+</span>
        </button>
      </div>
    </div>
  );
}

export function PassengerSelector({
  value,
  onChange,
  label = 'Passengers & Class',
}: PassengerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalPassengers = value.adults + value.children + value.infants;

  const updateCount = (type: keyof PassengerCount, delta: number) => {
    const newValue = { ...value };
    const newCount = newValue[type] + delta;

    // Validation rules
    if (type === 'adults' && (newCount < 1 || newCount < value.infants || totalPassengers + delta > 9)) return;
    if (type === 'children' && (newCount < 0 || totalPassengers + delta > 9)) return;
    if (type === 'infants' && (newCount < 0 || newCount > value.adults || totalPassengers + delta > 9)) return;
    if (newCount < 0) return;

    newValue[type] = newCount;
    onChange(newValue);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-surface-container-low/60 hover:bg-surface-container-low transition-colors rounded-lg p-space-md text-left"
      >
        <span className="font-label-sm text-outline uppercase tracking-wider flex items-center gap-1">
          <Icon name="group" size={16} className="text-secondary" />
          {label}
        </span>
        <div className="mt-1">
          <p className="font-headline-md text-on-surface font-semibold">
            {totalPassengers} Passenger{totalPassengers !== 1 ? 's' : ''}
          </p>
          <p className="font-body-sm text-secondary truncate mt-0.5 font-medium">
            Economy Class
          </p>
        </div>
      </button>

      {/* Dropdown */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Passengers"
        size="sm"
      >
        <div className="space-y-1">
          <CounterRow
            label="Adults"
            sublabel="12+ years"
            value={value.adults}
            onIncrement={() => updateCount('adults', 1)}
            onDecrement={() => updateCount('adults', -1)}
            canDecrement={value.adults > 1 && value.adults > value.infants}
            canIncrement={totalPassengers < 9}
          />
          <div className="border-t border-outline-variant" />
          <CounterRow
            label="Children"
            sublabel="2-11 years"
            value={value.children}
            onIncrement={() => updateCount('children', 1)}
            onDecrement={() => updateCount('children', -1)}
            canDecrement={value.children > 0}
            canIncrement={totalPassengers < 9}
          />
          <div className="border-t border-outline-variant" />
          <CounterRow
            label="Infants"
            sublabel="Under 2 years"
            value={value.infants}
            onIncrement={() => updateCount('infants', 1)}
            onDecrement={() => updateCount('infants', -1)}
            canDecrement={value.infants > 0}
            canIncrement={totalPassengers < 9 && value.infants < value.adults}
          />
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}
