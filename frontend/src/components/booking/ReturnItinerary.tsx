import { getLocale, localize } from '../../i18n/index';
import type { ReturnFlightInfo } from '../../api/bookingApi';

export function ReturnItinerary({ flight, fareName }: { flight?: ReturnFlightInfo; fareName?: string }) {
  if (!flight) return null;
  return <div className="my-4 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body-sm">
    <strong className="text-primary">{localize('Return flight')}: {flight.flightNumber} · {flight.origin} → {flight.destination}</strong>
    <p>{flight.departureTime && new Date(flight.departureTime).toLocaleString(getLocale())} {fareName && `· ${fareName}`}</p>
  </div>;
}
