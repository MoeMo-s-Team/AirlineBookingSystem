import { localize } from '../../i18n';

export function FlightDisruptionNotice({ outbound, inbound }: { outbound?: unknown; inbound?: unknown }) {
  const legs = [outbound, inbound].filter((leg): leg is { status?: string } => !!leg && typeof leg === 'object');
  if (!legs.some(leg => leg.status === 'CANCELLED' || leg.status === 'DELAYED')) return null;
  return <p role="status" className="my-3 rounded-xl border border-error/30 bg-error-container/20 p-3 text-body-sm text-error">
    {localize(legs.some(leg => leg.status === 'CANCELLED')
      ? 'A flight in this booking was cancelled. Contact support for rebooking or refund assistance.'
      : 'A flight in this booking has a schedule change. Please review the updated itinerary.')}
  </p>;
}
