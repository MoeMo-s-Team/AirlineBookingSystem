import { Chip } from '@/components/ui/Chip/Chip';

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface CabinClassSelectorProps {
  value: CabinClass;
  onChange: (cabinClass: CabinClass) => void;
  className?: string;
}

export const cabinClasses: { value: CabinClass; label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];

export function CabinClassSelector({
  value,
  onChange,
  className = '',
}: CabinClassSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {cabinClasses.map((cabin) => (
        <Chip
          key={cabin.value}
          selected={value === cabin.value}
          onClick={() => onChange(cabin.value)}
        >
          {cabin.label}
        </Chip>
      ))}
    </div>
  );
}
