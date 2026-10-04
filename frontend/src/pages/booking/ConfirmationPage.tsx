import { Link } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ETicket, type ETicketData } from '@/components/features/ETicket/ETicket';
import { Button } from '@/components/ui/Button/Button';
import { useBooking } from '@/context/BookingContext';

export function ConfirmationPage() {
  const { state, dispatch } = useBooking();

  const ticket: ETicketData = {
    bookingRef: 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    ticketNumber: 'TKT' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    flight: state.selectedFlight
      ? {
          number: state.selectedFlight.flightNumber,
          airline: state.selectedFlight.airline,
          aircraft: state.selectedFlight.aircraft,
          departure: {
            airport: state.selectedFlight.departure.airport,
            city: 'Hanoi',
            time: state.selectedFlight.departure.time,
            date: state.selectedFlight.departure.date,
            terminal: 'T1',
          },
          arrival: {
            airport: state.selectedFlight.arrival.airport,
            city: 'Ho Chi Minh City',
            time: state.selectedFlight.arrival.time,
            terminal: 'T2',
          },
          duration: state.selectedFlight.duration,
          cabinClass: state.selectedFlight.cabinClass.toUpperCase(),
        }
      : {
          number: 'VN1234',
          airline: 'SkyWing Airlines',
          aircraft: 'Boeing 787-9 Dreamliner',
          departure: { airport: 'HAN', city: 'Hanoi', time: '06:00', date: '2026-06-15', terminal: 'T1' },
          arrival: { airport: 'SGN', city: 'Ho Chi Minh City', time: '08:30', terminal: 'T2' },
          duration: '2h 30m',
          cabinClass: 'ECONOMY',
        },
    passenger: state.passengers[0]
      ? {
          name: `${state.passengers[0].firstName} ${state.passengers[0].lastName}`,
          type: 'Adult',
          seat: '12A',
        }
      : {
          name: 'Nguyen Van An',
          type: 'Adult',
          seat: '12A',
        },
  };

  const handleNewBooking = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        <ETicket ticket={ticket} onPrint={() => window.print()} />

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button variant="secondary" leftIcon="print" onClick={() => window.print()}>
            Print Ticket
          </Button>
          <Link to="/bookings">
            <Button variant="primary">
              View My Bookings
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" onClick={handleNewBooking}>
              Book Another Flight
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
