import { authenticatedFetch } from './apiClient';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PAYMENT_FAILED';

export interface BookingRequest {
  readonly flightId: number;
  readonly fareClassId: number;
  readonly passengers: readonly {
    readonly fullName: string;
    readonly dateOfBirth: string;
    readonly passportNo: string;
    readonly phone: string;
  }[];
  readonly services?: readonly { readonly serviceId: number; readonly quantity: number }[];
}

export interface BookingResponse {
  readonly id: number;
  readonly bookingCode: string;
  readonly status: BookingStatus;
  readonly flight: {
    readonly id: number;
    readonly flightNumber: string;
    readonly origin: string;
    readonly destination: string;
    readonly departureTime: string;
    readonly arrivalTime: string;
    readonly basePrice: number;
    readonly availableSeats: number;
    readonly prices: Readonly<Record<string, number>>;
  };
  readonly fareClass: { readonly id: number; readonly code: string; readonly name: string; readonly priceMultiplier: number; readonly active: boolean };
  readonly totalPrice: number;
  readonly createdAt: string;
}

export interface BookingDetailResponse extends BookingResponse {
  readonly passengers: readonly { readonly id: number; readonly fullName: string; readonly dateOfBirth: string; readonly passportNo: string; readonly phone: string }[];
  readonly services: readonly { readonly serviceId: number; readonly name: string; readonly quantity: number; readonly unitPrice: number }[];
  readonly priceBreakdown: { readonly baseFare: number; readonly servicesTotal: number; readonly total: number };
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
}

export async function createBooking(request: BookingRequest): Promise<BookingDetailResponse> {
  return requestBooking<BookingDetailResponse>('/bookings', { method: 'POST', body: JSON.stringify(request) });
}

export async function getMyBookings(status?: BookingStatus): Promise<readonly BookingResponse[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return requestBooking<readonly BookingResponse[]>(`/bookings/me${query}`, { method: 'GET' });
}

export async function cancelBooking(id: number): Promise<BookingResponse> {
  return requestBooking<BookingResponse>(`/bookings/${id}/cancel`, { method: 'PATCH' });
}

export async function getBooking(id: number): Promise<BookingDetailResponse> {
  return requestBooking<BookingDetailResponse>(`/bookings/${id}`, { method: 'GET' });
}

async function requestBooking<T>(path: string, init: RequestInit): Promise<T> {
  const response = await authenticatedFetch(path, init);
  const payload = await response.json() as ApiResponse<T>;
  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message ?? 'Không thể xử lý booking.');
  }
  return payload.data;
}
