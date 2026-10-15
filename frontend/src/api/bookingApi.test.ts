import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookingApi } from './bookingApi';
import { apiClient } from './apiClient';
import type { CreateBookingRequest, AdminBookingQuery } from './bookingApi';

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    getEnvelope: vi.fn(),
  },
}));

describe('bookingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBooking', () => {
    it('posts to /bookings with exact request preserving numeric IDs and 4 passenger fields', async () => {
      const request: CreateBookingRequest = {
        flightId: 42,
        fareClassId: 2,
        passengers: [
          {
            fullName: 'Nguyen Van A',
            dateOfBirth: '1990-01-01',
            passportNo: 'C1234567',
            phone: '0901234567',
          },
        ],
        services: [
          {
            serviceId: 5,
            quantity: 1,
          },
        ],
      };

      const mockResponse = {
        id: 101,
        bookingCode: 'BK-101',
        status: 'PENDING' as const,
        totalPrice: 1500000,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await bookingApi.createBooking(request);

      expect(apiClient.post).toHaveBeenCalledWith('/bookings', request);
      expect(result).toEqual(mockResponse);

      // Verify exact payload characteristics
      const calledPayload = vi.mocked(apiClient.post).mock.calls[0][1] as CreateBookingRequest;
      expect(typeof calledPayload.flightId).toBe('number');
      expect(typeof calledPayload.fareClassId).toBe('number');
      expect(typeof calledPayload.services?.[0]?.serviceId).toBe('number');
      expect(calledPayload.passengers[0]).toEqual({
        fullName: 'Nguyen Van A',
        dateOfBirth: '1990-01-01',
        passportNo: 'C1234567',
        phone: '0901234567',
      });
      expect(Object.keys(calledPayload.passengers[0])).toEqual([
        'fullName',
        'dateOfBirth',
        'passportNo',
        'phone',
      ]);
    });
  });

  describe('getMyBookings', () => {
    it('gets /bookings/me with status when provided', async () => {
      const mockList = [
        { id: 1, bookingCode: 'BK1', status: 'CONFIRMED' as const, totalPrice: 100 },
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockList);

      const result = await bookingApi.getMyBookings('CONFIRMED');

      expect(apiClient.get).toHaveBeenCalledWith('/bookings/me', { status: 'CONFIRMED' });
      expect(result).toEqual(mockList);
    });

    it('gets /bookings/me omitting status when undefined', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([]);

      const result = await bookingApi.getMyBookings();

      expect(apiClient.get).toHaveBeenCalledWith('/bookings/me', undefined);
      expect(result).toEqual([]);
    });
  });

  describe('getBooking', () => {
    it('gets /bookings/{id} and returns booking detail', async () => {
      const mockDetail = {
        id: 55,
        bookingCode: 'BK55',
        status: 'PENDING' as const,
        totalPrice: 200,
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockDetail);

      const result = await bookingApi.getBooking(55);

      expect(apiClient.get).toHaveBeenCalledWith('/bookings/55');
      expect(result).toEqual(mockDetail);
    });
  });

  describe('cancelBooking', () => {
    it('patches /bookings/{id}/cancel and returns minimal cancel response fixture', async () => {
      const minimalCancelFixture = {
        id: 77,
        bookingCode: 'BK77',
        status: 'CANCELLED' as const,
      };
      vi.mocked(apiClient.patch).mockResolvedValue(minimalCancelFixture);

      const result = await bookingApi.cancelBooking(77);

      expect(apiClient.patch).toHaveBeenCalledWith('/bookings/77/cancel');
      expect(result).toEqual(minimalCancelFixture);
      expect(Object.keys(result)).toEqual(['id', 'bookingCode', 'status']);
    });
  });

  describe('getAdminBookings', () => {
    it('calls getEnvelope with page, size, and status when defined and returns data + pagination', async () => {
      const envelopeFixture = {
        success: true,
        message: 'OK',
        data: [{ id: 123, bookingCode: 'BK123' }],
        pagination: {
          total: 1,
          page: 0,
          size: 20,
          totalPages: 1,
        },
      };
      vi.mocked(apiClient.getEnvelope).mockResolvedValue(envelopeFixture);

      const query: AdminBookingQuery = {
        page: 0,
        size: 20,
        status: 'PENDING',
      };

      const result = await bookingApi.getAdminBookings(query);

      expect(apiClient.getEnvelope).toHaveBeenCalledWith('/bookings', {
        page: 0,
        size: 20,
        status: 'PENDING',
      });
      expect(result).toEqual({
        data: envelopeFixture.data,
        pagination: envelopeFixture.pagination,
      });
      expect((result as any).success).toBeUndefined();
      expect((result as any).message).toBeUndefined();
    });

    it('omits status when status is undefined', async () => {
      const envelopeFixture = {
        success: true,
        data: [],
        pagination: { total: 0, page: 1, size: 10, totalPages: 0 },
      };
      vi.mocked(apiClient.getEnvelope).mockResolvedValue(envelopeFixture);

      const query: AdminBookingQuery = {
        page: 1,
        size: 10,
      };

      await bookingApi.getAdminBookings(query);

      expect(apiClient.getEnvelope).toHaveBeenCalledWith('/bookings', {
        page: 1,
        size: 10,
        status: undefined,
        userId: undefined,
      });
    });
  });
});
