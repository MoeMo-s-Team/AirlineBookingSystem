import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { Button } from '@/components/ui/Button/Button';

export interface FlightData {
  id: string;
  flightNumber: string;
  airline: string;
  aircraft: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  price: number;
  cabinClass: 'economy' | 'premium' | 'business';
  seatsAvailable: number;
}

export interface FlightCardProps {
  flight: FlightData;
  onSelect: (flight: FlightData) => void;
  selected?: boolean;
  className?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export function FlightCard({ flight, onSelect, selected = false, className = '' }: FlightCardProps) {
  const isNonstop = flight.stops === 0;

  return (
    <Card
      variant="elevated"
      hoverable
      padding="md"
      onClick={() => onSelect(flight)}
      className={`cursor-pointer transition-all ${selected ? 'ring-2 ring-secondary' : ''} ${className}`.trim()}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Airline & Flight Info */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
            <Icon name="flight" size={20} className="text-secondary" />
          </div>
          <div>
            <p className="font-label-lg text-on-surface font-semibold">
              {flight.flightNumber}
            </p>
            <p className="font-body-sm text-on-surface-variant">
              {flight.airline}
            </p>
          </div>
        </div>

        {/* Departure */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display-hero text-primary font-bold">
              {flight.departure.time}
            </span>
            <span className="font-headline-md text-secondary">
              {flight.departure.airport}
            </span>
          </div>
        </div>

        {/* Duration & Stops */}
        <div className="flex flex-col items-center min-w-[140px]">
          <span className="font-body-sm text-on-surface-variant">
            {flight.duration}
          </span>
          <div className="relative w-full flex items-center justify-center py-1">
            <div className="w-full h-0.5 bg-surface-variant" />
            {isNonstop ? (
              <Badge variant="success" size="sm" className="absolute">
                Non-stop
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm" className="absolute">
                {flight.stops} stop{flight.stops > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Arrival */}
        <div className="flex-1 text-right">
          <div className="flex items-baseline justify-end gap-2">
            <span className="font-display-hero text-primary font-bold">
              {flight.arrival.time}
            </span>
            <span className="font-headline-md text-secondary">
              {flight.arrival.airport}
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end min-w-[140px]">
          <span className="font-headline-sm text-primary font-bold">
            {formatPrice(flight.price)}
          </span>
          <span className="font-body-sm text-on-surface-variant">
            {flight.seatsAvailable} seats left
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant={flight.cabinClass === 'business' ? 'secondary' : 'neutral'}>
            {flight.cabinClass.charAt(0).toUpperCase() + flight.cabinClass.slice(1)}
          </Badge>
          <span className="font-body-sm text-on-surface-variant">
            {flight.aircraft}
          </span>
        </div>
        <Button 
          variant={selected ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            onSelect(flight);
          }}
        >
          {selected ? 'Selected' : 'Select'}
        </Button>
      </div>
    </Card>
  );
}
