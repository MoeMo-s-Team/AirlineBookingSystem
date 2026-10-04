import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { flights } from '@/mocks/flights';

export function AdminFlightsPage() {
  const [flightsList] = useState(flights);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-headline-lg text-primary">Flights</h1>
          <Badge variant="neutral">{flightsList.length} flights</Badge>
        </div>

        <Card variant="elevated" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Flight</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Route</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Time</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Aircraft</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Price</th>
                  <th className="px-4 py-3 text-left font-label-sm text-on-surface-variant">Seats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {flightsList.map((flight) => (
                  <tr key={flight.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-label-lg text-primary font-semibold">
                      {flight.flightNumber}
                    </td>
                    <td className="px-4 py-3 font-body-md text-on-surface">
                      {flight.departure.airport} → {flight.arrival.airport}
                    </td>
                    <td className="px-4 py-3 font-body-md text-on-surface">
                      {flight.departure.time} - {flight.arrival.time}
                    </td>
                    <td className="px-4 py-3 font-body-sm text-on-surface-variant">
                      {flight.aircraft}
                    </td>
                    <td className="px-4 py-3 font-body-md text-primary font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(flight.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={flight.seatsAvailable > 20 ? 'success' : 'warning'}>
                        {flight.seatsAvailable}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
