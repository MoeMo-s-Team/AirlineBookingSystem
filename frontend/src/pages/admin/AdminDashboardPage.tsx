import { AdminLayout } from '@/layouts/AdminLayout';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon, type IconName } from '@/components/ui/Icon/Icon';
import { flights } from '@/mocks/flights';
import { mockBookings } from '@/mocks/bookings';

interface StatItem {
  label: string;
  value: string | number;
  icon: IconName;
  color: string;
}

export function AdminDashboardPage() {
  const stats: StatItem[] = [
    {
      label: 'Total Flights',
      value: flights.length,
      icon: 'flight',
      color: 'text-primary',
    },
    {
      label: 'Active Bookings',
      value: mockBookings.filter((b) => b.status === 'confirmed').length,
      icon: 'book_online',
      color: 'text-secondary',
    },
    {
      label: "Today's Departures",
      value: 24,
      icon: 'departure_board',
      color: 'text-tertiary',
    },
    {
      label: 'Revenue (VND)',
      value: '125.6M',
      icon: 'payments',
      color: 'text-success',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-headline-lg text-headline-lg text-primary">
          Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-label-sm text-on-surface-variant">{stat.label}</p>
                  <p className={`font-headline-md ${stat.color} font-bold mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                  <Icon name={stat.icon} size={24} className={stat.color} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card variant="elevated" padding="md">
          <h2 className="font-headline-sm text-on-surface mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {mockBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0"
              >
                <div>
                  <p className="font-label-lg text-on-surface">{booking.bookingRef}</p>
                  <p className="font-body-sm text-on-surface-variant">
                    {booking.flight.number} · {booking.passenger.name}
                  </p>
                </div>
                <Badge
                  variant={
                    booking.status === 'confirmed' ? 'success' :
                    booking.status === 'completed' ? 'primary' : 'neutral'
                  }
                >
                  {booking.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
