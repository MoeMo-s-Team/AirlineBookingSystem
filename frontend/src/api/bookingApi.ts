import { apiClient } from './apiClient';
import type { ApiResponse } from './apiClient';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PAYMENT_FAILED';
export type PaymentStatus = 'SUCCESS' | 'FAILED';

export interface CreateBookingPassenger {
  fullName: string;
  dateOfBirth: string;
  passportNo: string;
  phone: string;
}

export interface CreateBookingServiceItem {
  serviceId: number;
  quantity: number;
}

export interface CreateBookingRequest {
  flightId: number;
  fareClassId: number;
  passengers: CreateBookingPassenger[];
  services?: CreateBookingServiceItem[];
}

export interface BookingDetail {
  id: number;
  bookingCode: string;
  status: BookingStatus;
  flight?: {
    id?: number;
    flightNumber?: string;
    originAirport?: string;
    destinationAirport?: string;
    departureTime?: string;
    arrivalTime?: string;
    [key: string]: unknown;
  };
  fareClass?: {
    id?: number;
    name?: string;
    code?: string;
    priceMultiplier?: number;
    [key: string]: unknown;
  };
  passengers?: Array<{
    id?: number;
    fullName?: string;
    dateOfBirth?: string;
    passportNo?: string;
    phone?: string;
    [key: string]: unknown;
  }>;
  services?: Array<{
    id?: number;
    serviceId?: number;
    serviceName?: string;
    unitPrice?: number;
    quantity?: number;
    totalPrice?: number;
    [key: string]: unknown;
  }>;
  priceBreakdown?: {
    baseFare?: number;
    fareMultiplier?: number;
    ticketPrice?: number;
    passengerCount?: number;
    totalTicketsPrice?: number;
    servicesPrice?: number;
    totalPrice?: number;
    [key: string]: unknown;
  };
  totalPrice?: number;
  payment?: {
    id?: number;
    paymentMethod?: string;
    status?: PaymentStatus;
    amount?: number;
    paidAt?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface BookingSummary {
  id: number;
  bookingCode: string;
  status: BookingStatus;
  flight?: {
    flightNumber?: string;
    originAirport?: string;
    destinationAirport?: string;
    departureTime?: string;
    arrivalTime?: string;
    [key: string]: unknown;
  };
  fareClass?: {
    name?: string;
    code?: string;
    [key: string]: unknown;
  };
  totalPrice?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface CancelBookingResponse {
  id: number;
  bookingCode: string;
  status: BookingStatus;
}

export interface AdminBookingPagination {
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface AdminBookingListRecord {
  id: number;
  bookingCode?: string;
  status?: BookingStatus;
  totalPrice?: number;
  createdAt?: string;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    [key: string]: unknown;
  };
  flight?: {
    flightNumber?: string;
    originAirport?: string;
    destinationAirport?: string;
    departureTime?: string;
    [key: string]: unknown;
  };
  fareClass?: {
    name?: string;
    code?: string;
    [key: string]: unknown;
  };
  passengers?: Array<{
    fullName?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface AdminBookingQuery {
  page: number;
  size: number;
  status?: BookingStatus;
  userId?: string;
}

export interface AdminBookingPage<T> {
  data: T[];
  pagination: AdminBookingPagination;
}

export type AdminBookingEnvelope<T> = ApiResponse<T[]> & {
  pagination: AdminBookingPagination;
};

export const bookingApi = {
  createBooking: (request: CreateBookingRequest): Promise<BookingDetail> =>
    apiClient.post<BookingDetail>('/bookings', request),

  getMyBookings: (status?: BookingStatus): Promise<BookingSummary[]> =>
    apiClient.get<BookingSummary[]>('/bookings/me', status !== undefined ? { status } : undefined),

  getBooking: (id: number): Promise<BookingDetail> =>
    apiClient.get<BookingDetail>(`/bookings/${id}`),

  cancelBooking: (id: number): Promise<CancelBookingResponse> =>
    apiClient.patch<CancelBookingResponse>(`/bookings/${id}/cancel`),

  getAdminBookings: async (query: AdminBookingQuery): Promise<AdminBookingPage<AdminBookingListRecord>> => {
    const envelope = await apiClient.getEnvelope<AdminBookingEnvelope<AdminBookingListRecord>>('/bookings', {
      page: query.page,
      size: query.size,
      status: query.status,
      userId: query.userId,
    });
    return {
      data: envelope.data,
      pagination: envelope.pagination,
    };
  },
};
