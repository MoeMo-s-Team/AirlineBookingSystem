import { Link } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { Icon } from '@/components/ui/Icon/Icon';
import { mockBookings } from '@/mocks/bookings';
import { useAuth } from '@/context/AuthContext';

export function MyBookingsPage() {
  const { user } = useAuth();
  const userBookings = user
    ? mockBookings.filter((b) => b.userId === user.id)
    : mockBookings;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-8">
          My Bookings
        </h1>

        {userBookings.length === 0 ? (
          <Card variant="elevated" padding="lg" className="text-center">
            <Icon name="flight" size={48} className="text-outline mx-auto mb-4" />
            <h2 className="font-headline-sm text-on-surface mb-2">
              No bookings yet
            </h2>
            <p className="font-body-md text-on-surface-variant mb-4">
              Start planning your next adventure
            </p>
            <Link to="/">
              <Button variant="primary">Search Flights</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {userBookings.map((booking) => (
              <Link key={booking.id} to={`/bookings/${booking.id}`}>
                <Card variant="elevated" padding="md" hoverable className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                      <Icon name="flight" size={24} className="text-secondary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-headline-sm text-primary font-semibold">
                          {booking.flight.number}
                        </span>
                        <Badge
                          variant={
                            booking.status === 'confirmed' ? 'success' :
                            booking.status === 'completed' ? 'primary' :
                            booking.status === 'cancelled' ? 'error' : 'neutral'
                          }
                        >
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="font-body-sm text-on-surface-variant">
                        {booking.flight.route} · {formatDate(booking.flight.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline-sm text-primary font-bold">
                      {formatPrice(booking.totalAmount)}
                    </p>
                    <p className="font-label-sm text-on-surface-variant">
                      {booking.bookingRef}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
