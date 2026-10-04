import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';

export interface ETicketData {
  bookingRef: string;
  ticketNumber: string;
  flight: {
    number: string;
    airline: string;
    aircraft: string;
    departure: {
      airport: string;
      city: string;
      time: string;
      date: string;
      terminal: string;
    };
    arrival: {
      airport: string;
      city: string;
      time: string;
      terminal: string;
    };
    duration: string;
    cabinClass: string;
  };
  passenger: {
    name: string;
    type: string;
    seat: string;
    tier?: string;
  };
}

export interface ETicketProps {
  ticket: ETicketData;
  onPrint?: () => void;
  className?: string;
}

export function ETicket({ ticket, onPrint, className = '' }: ETicketProps) {
  return (
    <Card variant="elevated" padding="lg" className={`overflow-hidden ${className}`.trim()}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
        <div>
          <Badge variant="success" className="mb-2">CONFIRMED & TICKETED</Badge>
          <h2 className="font-headline-lg text-primary">Thank You, Your Flight is Booked!</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" leftIcon="print" onClick={onPrint}>
            Print
          </Button>
        </div>
      </div>

      {/* Booking Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-outline-variant">
        <div className="bg-surface-container-low p-4 rounded-lg">
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
            Booking Reference (PNR)
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-label-code text-primary text-2xl">
              {ticket.bookingRef}
            </span>
            <button 
              type="button"
              aria-label="Copy booking reference"
              onClick={() => navigator.clipboard?.writeText(ticket.bookingRef)}
              className="p-1 rounded hover:bg-surface-container-high text-secondary"
            >
              <Icon name="content_copy" size={20} />
            </button>
          </div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg">
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
            E-Ticket Number
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-headline-sm text-on-surface">
              {ticket.ticketNumber}
            </span>
            <Icon name="verified" size={20} className="text-secondary" />
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="py-6 border-b border-outline-variant">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="flight_takeoff" size={28} className="text-secondary" />
          <div>
            <span className="font-headline-sm text-primary">
              {ticket.flight.airline} · {ticket.flight.number}
            </span>
            <span className="font-label-md text-on-surface-variant block">
              {ticket.flight.aircraft}
            </span>
          </div>
          <Badge variant={ticket.flight.cabinClass === 'Business' ? 'secondary' : 'neutral'}>
            {ticket.flight.cabinClass} Class
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Departure */}
          <div className="md:col-span-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display-hero text-primary font-bold">
                {ticket.flight.departure.time}
              </span>
              <span className="font-headline-lg text-secondary">
                {ticket.flight.departure.airport}
              </span>
            </div>
            <span className="font-label-lg text-on-surface block">
              {ticket.flight.departure.city}
            </span>
            <span className="font-body-sm text-on-surface-variant">
              Terminal {ticket.flight.departure.terminal}
            </span>
            <span className="font-label-md text-secondary block mt-1">
              {ticket.flight.departure.date}
            </span>
          </div>

          {/* Duration */}
          <div className="md:col-span-4 flex flex-col items-center">
            <span className="font-label-md text-on-surface-variant">
              {ticket.flight.duration}
            </span>
            <div className="relative w-full flex items-center justify-center py-2">
              <div className="w-full h-1 bg-surface-variant rounded-full" />
              <div className="absolute inset-x-0 h-1 bg-secondary rounded-full" />
              <div className="absolute bg-surface-container-lowest p-1 rounded-full text-secondary shadow-sm">
                <Icon name="airlines" size={18} />
              </div>
            </div>
            <span className="font-label-sm uppercase tracking-widest text-secondary font-bold">
              Non-stop Direct
            </span>
          </div>

          {/* Arrival */}
          <div className="md:col-span-4 text-left md:text-right">
            <div className="flex items-baseline md:justify-end gap-2">
              <span className="font-headline-lg text-secondary">
                {ticket.flight.arrival.airport}
              </span>
              <span className="font-display-hero text-primary font-bold">
                {ticket.flight.arrival.time}
              </span>
            </div>
            <span className="font-label-lg text-on-surface block">
              {ticket.flight.arrival.city}
            </span>
            <span className="font-body-sm text-on-surface-variant">
              Terminal {ticket.flight.arrival.terminal}
            </span>
          </div>
        </div>
      </div>

      {/* Passenger Info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
        <div>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
            Passenger
          </span>
          <span className="font-label-lg text-on-surface font-bold uppercase">
            {ticket.passenger.name}
          </span>
          <span className="font-body-sm text-on-surface-variant">
            {ticket.passenger.type}
          </span>
        </div>
        <div>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
            Seat
          </span>
          <span className="font-headline-sm text-secondary font-bold">
            {ticket.passenger.seat}
          </span>
        </div>
        {ticket.passenger.tier && (
          <div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
              Tier
            </span>
            <Badge variant="neutral">
              {ticket.passenger.tier}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
