import { useState, type FormEvent } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { flights } from '@/mocks/flights';
import type { FlightData } from '@/components/features/FlightCard/FlightCard';

export function FlightStatusPage() {
  const [flightNumber, setFlightNumber] = useState('');
  const [status, setStatus] = useState<FlightData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = flightNumber.trim().toUpperCase();
    if (!query) return;

    const found = flights.find(
      (f) => f.flightNumber.toUpperCase() === query
    );
    setStatus(found || null);
    setHasSearched(true);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-12">
        <h1 className="text-headline-lg text-primary mb-8">
          Flight Status
        </h1>

        <Card variant="elevated" padding="lg" className="mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter flight number (e.g., VN1234)"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </Card>

        {status && (
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge variant="success" className="mb-2">
                  On Time
                </Badge>
                <h2 className="font-headline-md text-primary font-bold">
                  {status.flightNumber}
                </h2>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-on-surface-variant">Aircraft</p>
                <p className="font-body-md text-on-surface font-semibold">{status.aircraft}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-label-sm text-on-surface-variant">Departure</p>
                <p className="font-headline-md text-primary font-bold">{status.departure.time}</p>
                <p className="font-body-sm text-on-surface">{status.departure.airport}</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Icon name="arrow_forward" size={24} className="text-secondary mb-1" />
                <p className="font-body-sm text-on-surface-variant">{status.duration}</p>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant">Arrival</p>
                <p className="font-headline-md text-primary font-bold">{status.arrival.time}</p>
                <p className="font-body-sm text-on-surface">{status.arrival.airport}</p>
              </div>
            </div>
          </Card>
        )}

        {!status && hasSearched && (
          <Card variant="elevated" padding="lg" className="text-center">
            <Icon name="search" size={48} className="text-outline mx-auto mb-4" />
            <p className="font-body-md text-on-surface-variant">
              No flight found for "{flightNumber}"
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
