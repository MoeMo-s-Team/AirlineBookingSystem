import type { FlightSearchParams } from '../types';

export function localToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateFlightSearch(params: FlightSearchParams): string | null {
  if (params.origin === params.destination) {
    return 'Sân bay đi và sân bay đến phải khác nhau.';
  }
  const date = new Date(`${params.departureDate}T00:00:00`);
  const dateMatches = !Number.isNaN(date.getTime()) &&
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      === params.departureDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.departureDate) || !dateMatches) {
    return 'Vui lòng chọn ngày bay hợp lệ.';
  }
  if (params.departureDate < localToday()) {
    return 'Ngày bay không được ở trong quá khứ.';
  }
  if (params.tripType === 'round-trip') {
    const returnDate = params.returnDate ?? '';
    const parsed = new Date(`${returnDate}T00:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(returnDate) || Number.isNaN(parsed.getTime())
      || `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}` !== returnDate) {
      return 'Please choose a valid return date.';
    }
    if (returnDate < params.departureDate) return 'Return date cannot precede departure date.';
  }
  return null;
}
