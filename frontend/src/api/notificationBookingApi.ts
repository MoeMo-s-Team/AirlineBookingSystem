import { apiClient } from './apiClient';

export interface NotificationBookingDetail {
  readonly id: number;
  readonly bookingCode: string;
  readonly status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PAYMENT_FAILED';
  readonly flight: {
    readonly flightNumber: string;
    readonly origin: string;
    readonly destination: string;
    readonly departureTime: string;
  };
  readonly fareClass: { readonly name: string };
  readonly passengers: readonly { readonly id: number; readonly fullName: string }[];
  readonly services: readonly { readonly id: number; readonly name: string; readonly quantity: number; readonly unitPrice: number }[];
  readonly totalPrice: number;
  readonly payment: { readonly status: 'SUCCESS' | 'FAILED'; readonly paidAt: string | null } | null;
}

export function getNotificationBookingDetail(id: number): Promise<NotificationBookingDetail> {
  return apiClient.get<NotificationBookingDetail>(`/bookings/${id}`);
}
