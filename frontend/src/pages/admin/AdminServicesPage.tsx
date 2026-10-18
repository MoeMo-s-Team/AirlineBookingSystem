import React, { useEffect, useState, useCallback } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { serviceApi, type ServiceResponse, type ServiceRequest, type ServiceType } from '../../api/serviceApi';
import { formatCurrency } from '../../utils/formatCurrency';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ServiceType>('ALL');

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceResponse | null>(null);
  const [formData, setFormData] = useState<ServiceRequest>({
    name: '',
    type: 'BAGGAGE',
    price: 100000,
    active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state for Delete confirmation
  const [deletingService, setDeletingService] = useState<ServiceResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all services from backend
  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await serviceApi.getAllServices();
      setServices(data);
    } catch (err: any) {
      const status = err?.status;
      if (status === 403) {
        setError('Tài khoản hiện tại không có quyền Quản trị viên (403 Forbidden). Vui lòng đăng nhập với tài khoản ADMIN.');
      } else if (err?.message?.includes('Failed to fetch') || status === 0) {
        setError('Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng kiểm tra dịch vụ.');
      } else {
        setError(err?.message || 'Đã xảy ra lỗi khi tải danh sách dịch vụ bổ trợ.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Handle open modal for Create
  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      type: 'BAGGAGE',
      price: 150000,
      active: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle open modal for Edit
  const handleOpenEdit = (svc: ServiceResponse) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      type: svc.type,
      price: svc.price,
      active: svc.active,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Tên dịch vụ không được để trống';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Tên dịch vụ tối đa 100 ký tự';
    }

    if (formData.price === undefined || formData.price === null || isNaN(formData.price)) {
      errors.price = 'Giá dịch vụ không được để trống';
    } else if (formData.price < 0) {
      errors.price = 'Giá dịch vụ không được âm';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Submit Create / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingService) {
        await serviceApi.updateService(editingService.id, {
          name: formData.name.trim(),
          type: formData.type,
          price: Number(formData.price),
          active: formData.active,
        });
        setSuccessMessage(`Đã cập nhật dịch vụ "${formData.name}" thành công.`);
      } else {
        await serviceApi.createService({
          name: formData.name.trim(),
          type: formData.type,
          price: Number(formData.price),
          active: formData.active,
        });
        setSuccessMessage(`Đã tạo mới dịch vụ "${formData.name}" thành công.`);
      }
      setIsModalOpen(false);
      await loadServices();
    } catch (err: any) {
      setFormErrors({
        submit: err?.message || 'Thao tác không thành công. Vui lòng thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active quick action
  const handleToggleActive = async (svc: ServiceResponse) => {
    try {
      await serviceApi.updateService(svc.id, {
        name: svc.name,
        type: svc.type,
        price: svc.price,
        active: !svc.active,
      });
      setSuccessMessage(`Đã ${svc.active ? 'tắt' : 'bật mở bán'} dịch vụ "${svc.name}".`);
      await loadServices();
    } catch (err: any) {
      setError(err?.message || 'Không thể đổi trạng thái dịch vụ.');
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    try {
      await serviceApi.deleteService(deletingService.id);
      setSuccessMessage(`Đã xóa dịch vụ "${deletingService.name}" thành công.`);
      setDeletingService(null);
      await loadServices();
    } catch (err: any) {
      setError(err?.message || 'Không thể xóa dịch vụ này.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list by search and type
  const filteredServices = services.filter(svc => {
    if (typeFilter !== 'ALL' && svc.type !== typeFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return svc.name.toLowerCase().includes(q) || svc.type.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="Ancillary Services Catalog"
          subtitle="Quản lý danh mục hành lý, suất ăn, chọn ghế và ưu tiên lên tàu bay"
          searchValue={search}
          onSearch={setSearch}
        />

        <main className="flex-1 p-8 space-y-6">
          {/* Notifications */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-secondary-fixed/50 border border-secondary text-on-secondary-fixed-variant flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
                <span className="text-body-sm font-semibold">{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-on-secondary-fixed-variant/70 hover:text-on-secondary-fixed-variant"
              >
                ✕
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-error-container/40 border border-error/40 text-on-error-container flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-error">error</span>
                <span className="text-body-sm font-semibold">{error}</span>
              </div>
              <button
                type="button"
                onClick={loadServices}
                className="px-3 py-1 rounded-lg bg-error text-on-error font-semibold text-xs hover:bg-error/90 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Thử lại</span>
              </button>
            </div>
          )}

          {/* Action Row & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-headline-sm font-bold text-primary">
                Active Catalog ({filteredServices.length} dịch vụ)
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Dịch vụ bổ sung được cung cấp cho hành khách trong luồng đặt vé.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold shadow-sm transition-all flex items-center gap-2 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Tạo Dịch Vụ Mới</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-label-sm text-outline uppercase font-semibold mr-1">Loại:</span>
            {(['ALL', 'BAGGAGE', 'MEAL', 'SEAT', 'PRIORITY_BOARDING'] as const).map(tab => {
              const meta = tab !== 'ALL' ? serviceApi.getTypeMeta(tab) : null;
              const isActive = typeFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTypeFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {meta && <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>}
                  <span>{tab === 'ALL' ? 'Tất cả' : meta?.label}</span>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[36px] animate-spin text-primary">progress_activity</span>
                <p className="mt-2 text-label-md">Đang tải danh sách dịch vụ bổ trợ từ máy chủ...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2">room_service</span>
                <p className="text-headline-sm font-bold text-primary">Không tìm thấy dịch vụ nào</p>
                <p className="mt-1 text-body-sm">
                  {search ? 'Không có dịch vụ nào khớp với từ khóa tìm kiếm.' : 'Chưa có dịch vụ nào trong hệ thống.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-outline uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-6">Tên dịch vụ</th>
                      <th className="py-3.5 px-6">Phân loại</th>
                      <th className="py-3.5 px-6">Đơn giá</th>
                      <th className="py-3.5 px-6 text-center">Trạng thái</th>
                      <th className="py-3.5 px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                    {filteredServices.map(svc => {
                      const meta = serviceApi.getTypeMeta(svc.type);
                      return (
                        <tr key={svc.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-[22px]">{meta.icon}</span>
                              </div>
                              <div>
                                <span className="font-bold text-primary text-label-md block">
                                  {svc.name}
                                </span>
                                <span className="text-[11px] text-on-surface-variant">
                                  ID: #{svc.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-primary font-semibold text-label-sm">
                              <span className="material-symbols-outlined text-[15px] text-secondary">{meta.icon}</span>
                              <span>{meta.label}</span>
                            </span>
                          </td>

                          <td className="py-4 px-6 font-bold text-primary text-headline-sm">
                            {formatCurrency(svc.price)}
                          </td>

                          <td className="py-4 px-6 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(svc)}
                              title="Bấm để bật/tắt mở bán"
                              className={`px-3 py-1 rounded-full text-label-sm font-semibold transition-all flex items-center gap-1.5 mx-auto ${
                                svc.active
                                  ? 'bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed/80'
                                  : 'bg-surface-container text-outline hover:bg-surface-container-high'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-current"></span>
                              <span>{svc.active ? 'ACTIVE' : 'INACTIVE'}</span>
                            </button>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(svc)}
                                className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-primary font-semibold text-label-sm transition-colors flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                <span>Sửa</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingService(svc)}
                                className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error-container/20 font-semibold text-label-sm transition-colors flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                <span>Xóa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Form Thêm mới / Chỉnh sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h3 className="text-headline-sm font-bold text-primary">
                {editingService ? `Chỉnh sửa: ${editingService.name}` : 'Tạo Dịch Vụ Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-primary text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {formErrors.submit && (
              <div className="p-3 rounded-lg bg-error-container/40 border border-error/30 text-on-error-container text-body-sm font-medium">
                {formErrors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-1">
                  Tên dịch vụ <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Suất ăn chay thanh đạm, Hành lý 20kg"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-surface-container-low text-body-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    formErrors.name ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-error font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Type Selection */}
              <div>
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-1">
                  Loại dịch vụ <span className="text-error">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as ServiceType })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-body-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="BAGGAGE">Hành lý ký gửi (BAGGAGE)</option>
                  <option value="MEAL">Suất ăn trên tàu bay (MEAL)</option>
                  <option value="SEAT">Chọn chỗ ngồi (SEAT)</option>
                  <option value="PRIORITY_BOARDING">Ưu tiên lên máy bay (PRIORITY_BOARDING)</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-1">
                  Đơn giá (VNĐ) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  step="10000"
                  min="0"
                  placeholder="Ví dụ: 200000"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-surface-container-low text-body-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    formErrors.price ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {formErrors.price && (
                  <p className="mt-1 text-xs text-error font-medium">{formErrors.price}</p>
                )}
                <p className="mt-1 text-xs font-semibold text-secondary">
                  Hiển thị: {formatCurrency(formData.price || 0)}
                </p>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-outline-variant">
                <div>
                  <span className="text-label-md font-bold text-primary block">Kích hoạt mở bán</span>
                  <span className="text-xs text-on-surface-variant">Cho phép hành khách lựa chọn dịch vụ này trong giỏ hàng</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-outline-variant flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-label-md font-semibold text-on-surface-variant transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-label-md shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                  <span>{editingService ? 'Lưu thay đổi' : 'Tạo dịch vụ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container/30 text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-headline-sm font-bold text-primary">Xác nhận xóa dịch vụ</h3>
              <p className="text-body-sm text-on-surface-variant">
                Bạn có chắc chắn muốn xóa vĩnh viễn dịch vụ <strong className="text-primary">{deletingService.name}</strong> không?
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingService(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-label-md font-semibold text-on-surface-variant transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-error hover:bg-error/90 text-on-error font-bold text-label-md shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                <span>Xóa vĩnh viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
