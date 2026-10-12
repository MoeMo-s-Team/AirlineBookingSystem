/**
 * API Client cho Module Dịch vụ Bổ trợ (Additional Service)
 * Giao tiếp trực tiếp với ServiceController tại Backend (/api/services)
 */

import { apiClient } from './apiClient';

export type ServiceType = 'BAGGAGE' | 'MEAL' | 'SEAT' | 'PRIORITY_BOARDING';

export interface ServiceResponse {
  id: number;
  name: string;
  type: ServiceType;
  price: number;
  active: boolean;
}

export interface ServiceRequest {
  name: string;
  type: ServiceType;
  price: number;
  active?: boolean;
}

export const serviceApi = {
  /**
   * Lấy danh sách dịch vụ đang hoạt động (active = true)
   * Có thể lọc theo loại dịch vụ (BAGGAGE, MEAL, SEAT, PRIORITY_BOARDING)
   */
  getActiveServices: async (type?: ServiceType): Promise<ServiceResponse[]> => {
    return apiClient.get<ServiceResponse[]>('/services', { type });
  },

  /**
   * Lấy toàn bộ danh sách dịch vụ bao gồm cả active và inactive
   * Dành cho màn hình Quản trị viên (Admin)
   */
  getAllServices: async (): Promise<ServiceResponse[]> => {
    return apiClient.get<ServiceResponse[]>('/services/all');
  },

  /**
   * Xem chi tiết một dịch vụ theo ID
   */
  getServiceById: async (id: number): Promise<ServiceResponse> => {
    return apiClient.get<ServiceResponse>(`/services/${id}`);
  },

  /**
   * Tạo mới một dịch vụ bổ trợ (Admin)
   */
  createService: async (data: ServiceRequest): Promise<ServiceResponse> => {
    return apiClient.post<ServiceResponse>('/services', data);
  },

  /**
   * Cập nhật thông tin và giá dịch vụ (Admin)
   */
  updateService: async (id: number, data: ServiceRequest): Promise<ServiceResponse> => {
    return apiClient.put<ServiceResponse>(`/services/${id}`, data);
  },

  /**
   * Xóa dịch vụ theo ID (Admin)
   */
  deleteService: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/services/${id}`);
  },

  /**
   * Helper ánh xạ ServiceType sang icon và nhãn tiếng Việt hiển thị trên giao diện
   */
  getTypeMeta: (type: ServiceType) => {
    switch (type) {
      case 'BAGGAGE':
        return { label: 'Hành lý', icon: 'luggage', color: 'blue' };
      case 'MEAL':
        return { label: 'Suất ăn', icon: 'restaurant', color: 'amber' };
      case 'SEAT':
        return { label: 'Chọn chỗ ngồi', icon: 'airline_seat_recline_extra', color: 'indigo' };
      case 'PRIORITY_BOARDING':
        return { label: 'Ưu tiên lên tàu bay', icon: 'flight_takeoff', color: 'emerald' };
      default:
        return { label: 'Dịch vụ', icon: 'room_service', color: 'gray' };
    }
  },
};
