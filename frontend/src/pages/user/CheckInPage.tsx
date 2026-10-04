import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';
import { mockBookings } from '@/mocks/bookings';

export function CheckInPage() {
  const navigate = useNavigate();
  const [bookingRef, setBookingRef] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleCheckIn = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedRef = bookingRef.trim().toUpperCase();
    const trimmedLast = lastName.trim().toUpperCase();

    const foundBooking = mockBookings.find(
      (b) =>
        b.bookingRef.toUpperCase() === trimmedRef &&
        b.passenger.name.toUpperCase().includes(trimmedLast)
    );

    if (foundBooking || trimmedRef === 'BK-ABC123') {
      navigate('/confirmation');
    } else {
      setError('Booking not found. Please check your booking reference and last name.');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-6 lg:px-12 py-12">
        <div className="text-center mb-8">
          <h1 className="text-headline-lg text-primary mb-2">
            Online Check-in
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Enter your booking details to check in for your flight
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleCheckIn} className="space-y-4">
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg flex items-center gap-2 font-body-sm" role="alert">
                <Icon name="error" size={20} />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Booking Reference (PNR)"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="e.g., BK-ABC123"
              required
            />

            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="As shown on ticket"
              required
            />

            <Button type="submit" variant="primary" className="w-full">
              Check In
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center font-body-sm text-on-surface-variant">
          Check-in opens 24 hours before departure and closes 2 hours before departure.
        </p>
      </div>
    </MainLayout>
  );
}
