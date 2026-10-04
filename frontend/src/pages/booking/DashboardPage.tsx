import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { SearchConsole, type SearchFormData } from '@/components/features/SearchConsole/SearchConsole';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';
import { airports } from '@/mocks/airports';
import { useBooking } from '@/context/BookingContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { dispatch } = useBooking();

  const handleSearch = (data: SearchFormData) => {
    dispatch({ type: 'SET_SEARCH', payload: data });
    navigate('/flights');
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative w-full bg-surface-container-low pt-12 pb-24 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-secondary-fixed/40 blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-4">
            <Icon name="flight_takeoff" size={16} />
            SKYWING A350 & BOEING 787 FLEET DEPLOYED
          </Badge>

          <h1 className="font-display-hero text-display-hero text-primary tracking-tight font-bold mb-4">
            Search and Book Flights Across Classes
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mb-8">
            Experience seamless journeys with premium comfort, transparent fares, and precision scheduled departures.
          </p>
        </div>
      </section>

      {/* Search Console */}
      <section className="relative max-w-6xl w-full mx-auto px-6 -mt-16 z-20">
        <SearchConsole
          airports={airports}
          onSearch={handleSearch}
        />
      </section>

      {/* Status Ribbon */}
      <section className="max-w-6xl w-full mx-auto px-6 mt-8">
        <div className="bg-surface-container-high/40 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-md text-primary font-semibold uppercase tracking-wider">
              Operational Dispatch
            </span>
            <span className="font-body-sm text-on-surface-variant">
              All flight corridors operating on normal seasonal timetable.
            </span>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
