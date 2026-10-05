import { Icon } from '@/components/ui/Icon/Icon';

export interface RouteDisplayProps {
  origin: {
    code: string;
    city: string;
  };
  destination: {
    code: string;
    city: string;
  };
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export function RouteDisplay({ 
  origin, 
  destination, 
  direction = 'horizontal',
  className = '' 
}: RouteDisplayProps) {
  if (direction === 'vertical') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`.trim()}>
        <span className="font-label-code text-primary font-bold">{origin.code}</span>
        <Icon name="arrow_downward" size={16} className="text-secondary" />
        <span className="font-label-code text-primary font-bold">{destination.code}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <span className="font-headline-md text-primary font-semibold">{origin.code}</span>
      <span className="font-body-sm text-on-surface-variant">({origin.city})</span>
      <Icon name="arrow_forward" size={16} className="text-secondary mx-2" />
      <span className="font-headline-md text-primary font-semibold">{destination.code}</span>
      <span className="font-body-sm text-on-surface-variant">({destination.city})</span>
    </div>
  );
}
