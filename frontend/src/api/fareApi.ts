/**
 * API Client cho Module Hạng vé (Fare Class)
 * Giao tiếp trực tiếp với FareController tại Backend (/api/fares)
 */

import { apiClient } from './apiClient';

export interface FareClassResponse {
  id: number;
  code: string;
  name: string;
  priceMultiplier: number;
  active: boolean;
}

export interface FareClassRequest {
  code: string;
  name: string;
  priceMultiplier: number;
  active?: boolean;
}

export const fareApi = {
  /**
   * Lấy danh sách tất cả các hạng vé đang mở bán (active = true)
   * Sử dụng cho màn hình đặt vé của khách hàng
   */
  getActiveFares: async (): Promise<FareClassResponse[]> => {
    return apiClient.get<FareClassResponse[]>('/fares');
  },

  /**
   * Lấy toàn bộ danh sách hạng vé bao gồm cả active và inactive
   * Dành riêng cho màn hình Quản trị viên (Admin)
   */
  getAllFares: async (): Promise<FareClassResponse[]> => {
    return apiClient.get<FareClassResponse[]>('/fares/all');
  },

  /**
   * Xem chi tiết thông tin 1 hạng vé theo ID
   */
  getFareById: async (id: number): Promise<FareClassResponse> => {
    return apiClient.get<FareClassResponse>(`/fares/${id}`);
  },

  /**
   * Thêm mới một hạng vé (Admin)
   */
  createFare: async (data: FareClassRequest): Promise<FareClassResponse> => {
    return apiClient.post<FareClassResponse>('/fares', data);
  },

  /**
   * Cập nhật thông tin hoặc giá nhân của hạng vé (Admin)
   */
  updateFare: async (id: number, data: FareClassRequest): Promise<FareClassResponse> => {
    return apiClient.put<FareClassResponse>(`/fares/${id}`, data);
  },

  /**
   * Xóa hạng vé theo ID (Admin)
   */
  deleteFare: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/fares/${id}`);
  },

  /**
   * Hàm tiện ích tính giá vé dựa trên Strategy Pattern ở Client
   * Công thức BR-002: basePrice * multiplier * passengerCount
   */
  calculatePrice: (basePrice: number, multiplier: number, passengerCount: number = 1): number => {
    if (!basePrice || basePrice <= 0 || !multiplier || passengerCount <= 0) {
      return 0;
    }
    return Math.round(basePrice * multiplier * passengerCount);
  },
};
