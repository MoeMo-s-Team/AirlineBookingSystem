import { apiClient } from './apiClient';
import type { PaymentStatus } from './bookingApi';

export type { PaymentStatus };

export interface ProcessPaymentRequest {
  bookingId: number;
  paymentMethod: 'MOCK';
}

export interface PaymentResponse {
  id: number;
  bookingId: number;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  transactionRef?: string;
  paidAt?: string;
  createdAt?: string;
}

export const paymentApi = {
  processPayment: (request: ProcessPaymentRequest): Promise<PaymentResponse> =>
    apiClient.post<PaymentResponse>('/payments', request),
};
