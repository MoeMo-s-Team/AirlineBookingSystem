import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentApi } from './paymentApi';
import { apiClient } from './apiClient';
import type { ProcessPaymentRequest, PaymentResponse } from './paymentApi';

vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('paymentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processPayment', () => {
    it('posts to /payments with bookingId and MOCK paymentMethod', async () => {
      const request: ProcessPaymentRequest = {
        bookingId: 88,
        paymentMethod: 'MOCK',
      };

      const mockResponse: PaymentResponse = {
        id: 1,
        bookingId: 88,
        amount: 2500000,
        paymentMethod: 'MOCK',
        status: 'SUCCESS',
        transactionRef: 'TXN-88-MOCK',
        paidAt: '2026-10-15T09:00:00',
        createdAt: '2026-10-15T09:00:00',
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await paymentApi.processPayment(request);

      expect(apiClient.post).toHaveBeenCalledWith('/payments', request);
      expect(result).toEqual(mockResponse);
    });
  });
});
