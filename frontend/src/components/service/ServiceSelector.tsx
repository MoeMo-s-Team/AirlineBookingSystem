import React, { useEffect, useState, useCallback } from 'react';
import { serviceApi, ServiceResponse } from '../../api/serviceApi';
import type { AncillaryService } from '../../types';
import type { BookingSelectedService } from '../../types/bookingFlow';
import { ServiceCard } from './ServiceCard';

export interface ServiceSelectorProps {
  readonly selectedServices: readonly (BookingSelectedService | AncillaryService)[];
  readonly onToggleService: (service: any) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  selectedServices,
  onToggleService,
}) => {
  const [services, setServices] = useState<AncillaryService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: ServiceResponse[] = await serviceApi.getActiveServices();

      // Ánh xạ ServiceResponse từ Backend sang AncillaryService của Frontend
      const mappedServices: AncillaryService[] = data.map(item => {
        const meta = serviceApi.getTypeMeta(item.type);
        const categoryMap: Record<string, AncillaryService['category']> = {
          BAGGAGE: 'baggage',
          MEAL: 'meal',
          SEAT: 'seat',
          PRIORITY_BOARDING: 'priority',
        };

        return {
          ...item,
          id: item.id as any,
          name: item.name,
          category: categoryMap[item.type] || 'priority',
          description: `Dịch vụ ${meta.label.toLowerCase()} tiêu chuẩn cao cấp giúp chuyến bay của bạn thoải mái và trọn vẹn hơn.`,
          price: Number(item.price),
          icon: meta.icon,
          active: item.active,
          badge: item.type === 'BAGGAGE' ? 'Phổ biến' : item.type === 'PRIORITY_BOARDING' ? 'Tiện lợi' : undefined,
        };
      });

      setServices(mappedServices);
    } catch (err: any) {
      if (err?.status === 500) {
        setError('Hệ thống máy chủ đang gặp sự cố khi xử lý dữ liệu dịch vụ (Mã lỗi: 500). Vui lòng thử lại sau ít phút.');
      } else if (err?.message?.includes('Failed to fetch') || err?.status === 0) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại dịch vụ Backend hoặc thử lại.');
      } else {
        setError(err?.message || 'Đã xảy ra sự cố khi tải danh sách dịch vụ bổ trợ.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // 1. Trạng thái Đang tải dữ liệu (Loading State) - Hiển thị Skeleton Loader
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(idx => (
          <div
            key={idx}
            className="animate-pulse bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col justify-between h-56"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-surface-container mb-4"></div>
              <div className="h-5 bg-outline-variant/60 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-outline-variant/40 rounded w-full mb-1"></div>
              <div className="h-3 bg-outline-variant/30 rounded w-2/3"></div>
            </div>
            <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-between">
              <div className="h-6 bg-outline-variant/60 rounded w-1/3"></div>
              <div className="h-8 bg-outline-variant/50 rounded-lg w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Trạng thái Xảy ra lỗi (Error State) - Báo lỗi thân thiện & có nút Thử lại
  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-error-container/20 border border-error/30 text-center">
        <div className="w-14 h-14 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>
        <h3 className="text-headline-sm font-bold text-error mb-2">
          Không thể tải dịch vụ bổ trợ
        </h3>
        <p className="text-body-sm text-on-surface-variant max-w-md mx-auto mb-6">
          {error}
        </p>
        <button
          type="button"
          onClick={fetchServices}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-label-md transition-all shadow-sm flex items-center gap-2 mx-auto"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  // 3. Trạng thái Không có dữ liệu (Empty State)
  if (services.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-outline mx-auto mb-3">
          <span className="material-symbols-outlined text-[28px]">info</span>
        </div>
        <h4 className="text-headline-sm font-bold text-primary mb-1">
          Chưa có dịch vụ bổ trợ khả dụng
        </h4>
        <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
          Hiện tại chuyến bay này chưa có dịch vụ bổ trợ nào khả dụng. Quý khách có thể tiếp tục sang bước thanh toán.
        </p>
      </div>
    );
  }

  // 4. Trạng thái Thành công - Hiển thị danh sách dịch vụ thật từ Supabase
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {services.map(service => (
        <ServiceCard
          key={service.id}
          service={service}
          isSelected={selectedServices.some(s => String(s.id) === String(service.id))}
          onToggle={onToggleService}
        />
      ))}
    </div>
  );
};
