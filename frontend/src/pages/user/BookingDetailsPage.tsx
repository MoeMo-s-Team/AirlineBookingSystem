import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ETicket, type ETicketData } from '@/components/features/ETicket/ETicket';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';
import { mockBookings } from '@/mocks/bookings';

export function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const booking = mockBookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 text-center">
          <Icon name="error" size={48} className="text-error mx-auto mb-4" />
          <h2 className="font-headline-sm text-on-surface mb-2">Booking not found</h2>
          <Link to="/bookings">
            <Button variant="secondary">Back to My Bookings</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const ticket: ETicketData = {
    bookingRef: booking.bookingRef,
    ticketNumber: 'TKT' + booking.bookingRef.replace('BK-', ''),
    flight: {
      number: booking.flight.number,
      airline: 'SkyWing Airlines',
      aircraft: 'Boeing 787-9 Dreamliner',
      departure: {
        airport: booking.flight.departure.airport,
        city: booking.flight.departure.airport === 'HAN' ? 'Hanoi' : 'Ho Chi Minh City',
        time: booking.flight.departure.time,
        date: booking.flight.date,
        terminal: 'T1',
      },
      arrival: {
        airport: booking.flight.arrival.airport,
        city: booking.flight.arrival.airport === 'SGN' ? 'Ho Chi Minh City' : 'Da Nang',
        time: booking.flight.arrival.time,
        terminal: 'T2',
      },
      duration: '2h 30m',
      cabinClass: booking.flight.cabinClass.toUpperCase(),
    },
    passenger: booking.passenger,
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-6"
        >
          <Icon name="arrow_back" size={18} />
          Back to My Bookings
        </Link>

        <ETicket ticket={ticket} onPrint={() => window.print()} />

        <div className="mt-8 flex gap-4">
          <Button variant="secondary" leftIcon="print" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="secondary" leftIcon="download" onClick={() => window.print()}>
            Download PDF
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
