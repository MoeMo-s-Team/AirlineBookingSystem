import { authenticatedFetch } from './apiClient';

export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'MOCK';

export interface PaymentResponse {
  readonly id: number;
  readonly bookingId: number;
  readonly amount: number;
  readonly paymentMethod: PaymentMethod;
  readonly status: 'SUCCESS' | 'FAILED';
  readonly transactionRef: string | null;
  readonly paidAt: string | null;
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
}

export async function processPayment(bookingId: number, paymentMethod: PaymentMethod): Promise<PaymentResponse> {
  const response = await authenticatedFetch('/payments', {
    method: 'POST',
    body: JSON.stringify({ bookingId, paymentMethod })
  });
  const payload = await response.json() as ApiResponse<PaymentResponse>;
  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message ?? 'Không thể xử lý thanh toán.');
  }
  return payload.data;
}
