import { useState } from 'react';
import { Icon } from '@/components/ui/Icon/Icon';
import { Button } from '@/components/ui/Button/Button';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { AirportPicker } from '../AirportPicker/AirportPicker';
import { DatePicker } from '../DatePicker/DatePicker';
import { PassengerSelector } from '../PassengerSelector/PassengerSelector';
import { CabinClassSelector } from '../CabinClassSelector/CabinClassSelector';
import { TripTypeToggle } from '../TripTypeToggle/TripTypeToggle';
import type { Airport } from '../AirportPicker/types';
import type { PassengerCount } from '../PassengerSelector/PassengerSelector';
import type { CabinClass } from '../CabinClassSelector/CabinClassSelector';
import type { TripType } from '../TripTypeToggle/TripTypeToggle';

export interface SearchFormData {
  origin?: Airport;
  destination?: Airport;
  departureDate?: Date;
  returnDate?: Date;
  passengers: PassengerCount;
  cabinClass: CabinClass;
  tripType: TripType;
  directFlightsOnly: boolean;
}

export interface SearchConsoleProps {
  airports: Airport[];
  initialValues?: Partial<SearchFormData>;
  onSearch: (values: SearchFormData) => void;
  className?: string;
}

export function SearchConsole({
  airports,
  initialValues,
  onSearch,
  className = '',
}: SearchConsoleProps) {
  const [formData, setFormData] = useState<SearchFormData>({
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'economy',
    tripType: 'roundtrip',
    directFlightsOnly: true,
    ...initialValues,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const swapAirports = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  const handleSearch = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.origin) newErrors.origin = 'Please select origin';
    if (!formData.destination) newErrors.destination = 'Please select destination';
    if (!formData.departureDate) newErrors.departureDate = 'Please select date';
    if (formData.tripType === 'roundtrip' && !formData.returnDate) {
      newErrors.returnDate = 'Please select return date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSearch(formData);
  };

  const isRoundTrip = formData.tripType === 'roundtrip';

  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-xl p-6 lg:p-8 ${className}`.trim()}>
      {/* Trip Type & Cabin Class Selection */}
      <div className="flex flex-wrap items-center justify-between gap-space-md mb-6">
        <TripTypeToggle
          value={formData.tripType}
          onChange={(tripType) => {
            setFormData((prev) => ({ ...prev, tripType }));
            if (tripType !== 'roundtrip') {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.returnDate;
                return next;
              });
            }
          }}
        />
        <CabinClassSelector
          value={formData.cabinClass}
          onChange={(cabinClass) => setFormData((prev) => ({ ...prev, cabinClass }))}
        />
      </div>

      {/* Search Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-md items-center">
        {/* Origin */}
        <div className={isRoundTrip ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <AirportPicker
            type="origin"
            label="From"
            value={formData.origin}
            onChange={(airport) => {
              setFormData((prev) => ({ ...prev, origin: airport }));
              setErrors((prev) => ({ ...prev, origin: '' }));
            }}
            airports={airports}
          />
          {errors.origin && (
            <p className="text-error text-body-sm mt-1">{errors.origin}</p>
          )}
        </div>

        {/* Swap Button */}
        <div className="hidden lg:flex lg:col-span-1 justify-center -mx-2 z-10">
          <button
            type="button"
            onClick={swapAirports}
            aria-label="Swap departure and destination"
            className="w-10 h-10 rounded-full bg-surface-container-lowest text-secondary hover:bg-surface-container shadow-md flex items-center justify-center transition-transform hover:rotate-180"
          >
            <Icon name="swap_horiz" size={20} />
          </button>
        </div>

        {/* Destination */}
        <div className={isRoundTrip ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <AirportPicker
            type="destination"
            label="To"
            value={formData.destination}
            onChange={(airport) => {
              setFormData((prev) => ({ ...prev, destination: airport }));
              setErrors((prev) => ({ ...prev, destination: '' }));
            }}
            airports={airports}
          />
          {errors.destination && (
            <p className="text-error text-body-sm mt-1">{errors.destination}</p>
          )}
        </div>

        {/* Departure Date */}
        <div className="lg:col-span-2">
          <DatePicker
            label="Departure"
            value={formData.departureDate}
            onChange={(date) => {
              setFormData((prev) => ({ ...prev, departureDate: date }));
              setErrors((prev) => ({ ...prev, departureDate: '' }));
            }}
          />
          {errors.departureDate && (
            <p className="text-error text-body-sm mt-1">{errors.departureDate}</p>
          )}
        </div>

        {/* Return Date (Round Trip) */}
        {isRoundTrip && (
          <div className="lg:col-span-2">
            <DatePicker
              label="Return"
              minDate={formData.departureDate}
              value={formData.returnDate}
              onChange={(date) => {
                setFormData((prev) => ({ ...prev, returnDate: date }));
                setErrors((prev) => ({ ...prev, returnDate: '' }));
              }}
            />
            {errors.returnDate && (
              <p className="text-error text-body-sm mt-1">{errors.returnDate}</p>
            )}
          </div>
        )}

        {/* Passengers */}
        <div className="lg:col-span-3">
          <PassengerSelector
            value={formData.passengers}
            onChange={(passengers) => setFormData((prev) => ({ ...prev, passengers }))}
          />
        </div>
      </div>

      {/* Quick Toggles & Action */}
      <div className="mt-space-lg pt-space-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
        {/* Flight Preferences */}
        <div className="flex flex-wrap items-center gap-space-lg">
          <Checkbox
            label="Direct flights only"
            checked={formData.directFlightsOnly}
            onChange={(checked) => setFormData((prev) => ({ ...prev, directFlightsOnly: checked }))}
          />
        </div>

        {/* Search Button */}
        <Button
          variant="primary"
          size="lg"
          leftIcon="search"
          onClick={handleSearch}
          className="min-w-[220px]"
        >
          Search Flights
        </Button>
      </div>
    </div>
  );
}
