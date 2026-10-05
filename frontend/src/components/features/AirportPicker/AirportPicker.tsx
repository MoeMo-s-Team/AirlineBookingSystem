import { useState, useMemo, useCallback } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Icon } from '@/components/ui/Icon/Icon';
import { Modal } from '@/components/ui/Modal/Modal';
import { Input } from '@/components/ui/Input/Input';
import type { Airport, AirportPickerProps } from './types';

export type { Airport, AirportPickerProps } from './types';

export function AirportPicker({
  value,
  onChange,
  airports,
  label = 'Select Airport',
  placeholder = 'Search city or airport',
  type = 'origin',
}: AirportPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const iconName = type === 'origin' ? 'flight_takeoff' : 'flight_land';

  const filteredAirports = useMemo(() => {
    if (!debouncedSearch) return airports.slice(0, 8);
    const query = debouncedSearch.toLowerCase();
    return airports
      .filter(
        (airport) =>
          airport.code.toLowerCase().includes(query) ||
          airport.name.toLowerCase().includes(query) ||
          airport.city.toLowerCase().includes(query) ||
          airport.country.toLowerCase().includes(query)
      )
      .slice(0, 10);
  }, [debouncedSearch, airports]);

  const handleSelect = useCallback((airport: Airport) => {
    onChange(airport);
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-surface-container-low/60 hover:bg-surface-container-low transition-colors rounded-lg p-space-md text-left group"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-outline uppercase tracking-wider flex items-center gap-1">
            <Icon name={iconName} size={16} className="text-secondary" />
            {label}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm">
            {type === 'origin' ? 'ORIGIN' : 'DEST'}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          {value ? (
            <>
              <p className="font-headline-md text-primary font-semibold truncate">
                {value.code}
              </p>
              <p className="font-body-sm text-on-surface-variant truncate text-right">
                {value.city}
              </p>
            </>
          ) : (
            <p className="font-headline-md text-on-surface-variant">
              {placeholder}
            </p>
          )}
        </div>
        {value && (
          <p className="font-body-sm text-outline truncate mt-0.5">
            {value.name}
          </p>
        )}
      </button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSearch('');
        }}
        title={label}
        size="md"
      >
        <div className="space-y-4">
          {/* Search Input */}
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon="search"
          />

          {/* Results */}
          <div className="max-h-80 overflow-y-auto space-y-1">
            {debouncedSearch ? (
              <p className="font-label-sm text-outline uppercase tracking-wider px-1">
                Search Results
              </p>
            ) : (
              filteredAirports.length > 0 && (
                <p className="font-label-sm text-outline uppercase tracking-wider px-1">
                  Popular Airports
                </p>
              )
            )}

            {filteredAirports.length === 0 && debouncedSearch && (
              <p className="text-center py-8 text-on-surface-variant">
                No airports found
              </p>
            )}

            {filteredAirports.map((airport) => (
              <button
                key={airport.code}
                onClick={() => handleSelect(airport)}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                  <Icon name="flight" size={20} className="text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-primary font-semibold">
                      {airport.code}
                    </span>
                    <span className="font-body-sm text-on-surface-variant truncate">
                      {airport.city}, {airport.country}
                    </span>
                  </div>
                  <p className="font-body-sm text-outline truncate">
                    {airport.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
