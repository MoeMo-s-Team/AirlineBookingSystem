import { localize, useLanguage } from '../../i18n/index';
import React, { useEffect, useState, useCallback } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { fareApi, type FareClassResponse, type FareClassRequest } from '../../api/fareApi';
import { getFareBenefits } from '../../config/fareBenefits';

export const AdminFareClassesPage: React.FC = () => {
  useLanguage();
  const [fares, setFares] = useState<FareClassResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFare, setEditingFare] = useState<FareClassResponse | null>(null);
  const [formData, setFormData] = useState<FareClassRequest>({
    code: '',
    name: '',
    priceMultiplier: 1.0,
    active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [multiplierInput, setMultiplierInput] = useState('1');
  const inferredBenefits = getFareBenefits('', formData.priceMultiplier);
  const defaultBenefits = { ...inferredBenefits, baggage: inferredBenefits.baggage.replace('VIP baggage', 'VIP') };
  const hasValidMultiplier = Number.isFinite(formData.priceMultiplier) && formData.priceMultiplier >= 0.01 && formData.priceMultiplier <= 999.99;

  // Modal state for Delete confirmation
  const [deletingFare, setDeletingFare] = useState<FareClassResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all fares from backend
  const loadFares = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fareApi.getAllFares();
      setFares(data);
    } catch (err: any) {
      const status = err?.status;
      if (status === 403) {
        setError('Tài khoản hiện tại không có quyền Quản trị viên (403 Forbidden). Vui lòng đăng nhập với tài khoản ADMIN.');
      } else if (err?.message?.includes('Failed to fetch') || status === 0) {
        setError('Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng kiểm tra dịch vụ.');
      } else {
        setError(err?.message || 'Đã xảy ra lỗi khi tải danh sách hạng vé.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFares();
  }, [loadFares]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Handle open modal for Create
  const handleOpenCreate = () => {
    setEditingFare(null);
    setMultiplierInput('1');
    setFormData({
      code: '',
      name: '',
      priceMultiplier: 1.0,
      active: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle open modal for Edit
  const handleOpenEdit = (fare: FareClassResponse) => {
    setEditingFare(fare);
    setMultiplierInput(String(fare.priceMultiplier));
    setFormData({
      code: fare.code,
      name: fare.name,
      priceMultiplier: fare.priceMultiplier,
      active: fare.active,
      baggage: fare.baggage ?? '',
      seatPitch: fare.seatPitch ?? '',
      meal: fare.meal ?? '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.code.trim()) {
      errors.code = 'Mã hạng vé không được để trống';
    } else if (formData.code.trim().length > 20) {
      errors.code = 'Mã hạng vé tối đa 20 ký tự';
    }

    if (!formData.name.trim()) {
      errors.name = 'Tên hạng vé không được để trống';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Tên hạng vé tối đa 100 ký tự';
    }

    if (!Number.isFinite(formData.priceMultiplier)) {
      errors.priceMultiplier = 'Hệ số nhân giá không được để trống';
    } else if (formData.priceMultiplier < 0.01 || formData.priceMultiplier > 999.99) {
      errors.priceMultiplier = 'Hệ số nhân giá phải từ 0,01 đến 999,99';
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
      if (editingFare) {
        await fareApi.updateFare(editingFare.id, {
          baggage: formData.baggage?.trim() ?? '',
          seatPitch: formData.seatPitch?.trim() ?? '',
          meal: formData.meal?.trim() ?? '',
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          priceMultiplier: Number(formData.priceMultiplier),
          active: formData.active,
        });
        setSuccessMessage(`Đã cập nhật hạng vé "${formData.name}" thành công.`);
      } else {
        await fareApi.createFare({
          baggage: formData.baggage?.trim() ?? '',
          seatPitch: formData.seatPitch?.trim() ?? '',
          meal: formData.meal?.trim() ?? '',
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          priceMultiplier: Number(formData.priceMultiplier),
          active: formData.active,
        });
        setSuccessMessage(`Đã tạo mới hạng vé "${formData.name}" thành công.`);
      }
      setIsModalOpen(false);
      await loadFares();
    } catch (err: any) {
      setFormErrors({
        submit: err?.message || 'Thao tác không thành công. Vui lòng thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active quick action
  const handleToggleActive = async (fare: FareClassResponse) => {
    try {
      await fareApi.updateFare(fare.id, {
        code: fare.code,
        name: fare.name,
        priceMultiplier: fare.priceMultiplier,
        active: !fare.active,
      });
      setSuccessMessage(`Đã ${fare.active ? 'ngừng kích hoạt' : 'kích hoạt mở bán'} hạng vé "${fare.name}".`);
      await loadFares();
    } catch (err: any) {
      setError(err?.message || 'Không thể đổi trạng thái hạng vé.');
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingFare) return;
    setIsDeleting(true);
    try {
      await fareApi.deleteFare(deletingFare.id);
      setSuccessMessage(`Đã xóa hạng vé "${deletingFare.name}" thành công.`);
      setDeletingFare(null);
      await loadFares();
    } catch (err: any) {
      setDeletingFare(null);
      setError(err?.message || 'Không thể xóa hạng vé này.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list by search
  const filteredFares = fares.filter(f => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title={localize("Fare Classes Management")}
          subtitle={localize("Quản lý danh mục hạng vé, hệ số nhân giá và cấu hình mở bán (Strategy Pattern)")}
          searchValue={search}
          onSearch={setSearch}
        />

        <main className="flex-1 p-8 space-y-6">
          {/* Notifications */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-secondary-fixed/50 border border-secondary text-on-secondary-fixed-variant flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
                <span className="text-body-sm font-semibold">{localize(successMessage)}</span>
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
                <span className="text-body-sm font-semibold">{localize(error)}</span>
              </div>
              <button
                type="button"
                onClick={loadFares}
                className="px-3 py-1 rounded-lg bg-error text-on-error font-semibold text-xs hover:bg-error/90 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>{localize("Thử lại")}</span>
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-headline-sm font-bold text-primary">{localize("Cabin Fare Tiers (")}{localize(filteredFares.length)}{localize(" hạng vé) ")}</h2>
              <p className="text-body-sm text-on-surface-variant">{localize("Dữ liệu trực tiếp từ Supabase Database qua API Backend (")}<code className="text-primary font-sans text-xs">{localize("/api/fares")}</code>).
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold shadow-sm transition-all flex items-center gap-2 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>{localize("Thêm Hạng Vé Mới")}</span>
            </button>
          </div>

          {/* Table Content */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[36px] animate-spin text-primary">progress_activity</span>
                <p className="mt-2 text-label-md">{localize("Đang tải danh sách hạng vé từ máy chủ...")}</p>
              </div>
            ) : filteredFares.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2">inventory_2</span>
                <p className="text-headline-sm font-bold text-primary">{localize("Không tìm thấy hạng vé nào")}</p>
                <p className="mt-1 text-body-sm">
                  {localize(search ? 'Không có hạng vé nào khớp với từ khóa tìm kiếm.' : 'Chưa có hạng vé nào trong hệ thống.')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-outline uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-6">{localize("Mã hạng vé")}</th>
                      <th className="py-3.5 px-6">{localize("Tên hạng vé")}</th>
                      <th className="py-3.5 px-6 text-center">{localize("Hệ số nhân (Multiplier)")}</th>
                      <th className="py-3.5 px-6 text-center">{localize("Trạng thái mở bán")}</th>
                      <th className="py-3.5 px-6 text-right">{localize("Thao tác")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                    {filteredFares.map(fare => (
                      <tr key={fare.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4 px-6 font-sans font-bold text-primary">
                          <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant text-label-md">
                            {localize(fare.code)}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="font-bold text-primary text-label-lg block">
                            {localize(fare.name)}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-bold text-label-md">{localize("x")}{localize(Number(fare.priceMultiplier).toFixed(2))}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(fare)}
                            title={localize("Bấm để bật/tắt mở bán")}
                            className={`px-3 py-1 rounded-full text-label-sm font-semibold transition-all flex items-center gap-1.5 mx-auto ${
                              fare.active
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            <span>{localize(fare.active ? 'ĐANG MỞ BÁN' : 'TẠM ẨN')}</span>
                          </button>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(fare)}
                              className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-primary font-semibold text-label-sm transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              <span>{localize("Sửa")}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingFare(fare)}
                              className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error-container/20 font-semibold text-label-sm transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>{localize("Xóa")}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h3 className="text-headline-sm font-bold text-primary">
                {localize(editingFare ? `Chỉnh sửa Hạng vé: ${editingFare.name}` : 'Thêm Hạng Vé Mới')}
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
                {localize(formErrors.submit)}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-1">{localize("Mã hạng vé (Code) ")}<span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder={localize("Ví dụ: FIRST, BUSINESS, PREMIUM")}
                  aria-label={localize("Mã hạng vé")}
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  disabled={!!editingFare} // Mã code thường là định danh duy nhất
                  className={`w-full px-4 py-2.5 rounded-xl border bg-surface-container-low text-body-sm font-sans text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    formErrors.code ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {formErrors.code && (
                  <p className="mt-1 text-xs text-error font-medium">{localize(formErrors.code)}</p>
                )}
                {editingFare && (
                  <p className="mt-1 text-body-sm text-on-surface-variant">{localize("Mã hạng vé là khóa định danh, không thể thay đổi sau khi tạo.")}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-1">{localize("Tên hạng vé hiển thị ")}<span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder={localize("Ví dụ: First Class, Hạng Thương gia Đặc biệt")}
                  aria-label={localize("Tên hạng vé")}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-surface-container-low text-body-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    formErrors.name ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-error font-medium">{localize(formErrors.name)}</p>
                )}
              </div>

              {/* Price Multiplier */}
              <div>
                <label className="text-label-sm font-semibold text-outline uppercase tracking-wider block mb-1">{localize("Hệ số nhân giá (Price Multiplier) ")}<span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-body-md font-bold text-outline">{localize("x")}</span>
                  <input
                    type="number"
                    aria-label={localize("Hệ số nhân giá")}
                    step="0.01"
                    min="0.01"
                    max="999.99"
                    placeholder={localize("Ví dụ: 1.5, 2.5, 3.0")}
                    value={multiplierInput}
                    onChange={e => {
                      const input = e.target.value;
                      const multiplier = input === '' ? Number.NaN : Number(input);
                      setMultiplierInput(input);
                      setFormData(previous => Object.is(previous.priceMultiplier, multiplier) ? previous : ({
                        ...previous,
                        priceMultiplier: multiplier,
                        baggage: '',
                        seatPitch: '',
                        meal: '',
                      }));
                    }}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border bg-surface-container-low text-body-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      formErrors.priceMultiplier ? 'border-error' : 'border-outline-variant focus:border-primary'
                    }`}
                  />
                </div>
                {formErrors.priceMultiplier && (
                  <p className="mt-1 text-xs text-error font-medium">{localize(formErrors.priceMultiplier)}</p>
                )}
                <p className="mt-1 text-body-sm text-on-surface-variant">{localize("Công thức tính giá vé: Giá vé = Giá chuyến bay gốc × Hệ số này. ")}</p>
              </div>

              <fieldset className="space-y-3 border-t border-outline-variant pt-4">
                <legend className="text-label-lg font-semibold text-primary">{localize("Quyền lợi hạng vé")}</legend>
                <button
                  type="button"
                  disabled={!hasValidMultiplier || isSubmitting}
                  onClick={() => setFormData(previous => ({
                    ...previous,
                    baggage: defaultBenefits.baggage,
                    seatPitch: defaultBenefits.seatPitch,
                    meal: defaultBenefits.meal,
                  }))}
                  className="text-label-md font-semibold text-primary hover:underline disabled:opacity-50"
                >{localize("⚡ Tự động điền theo hệ số ")}</button>
                {([
                  ['baggage', 'Hành lý'],
                  ['seatPitch', 'Khoảng cách / loại ghế'],
                  ['meal', 'Suất ăn'],
                ] as const).map(([field, label]) => (
                  <label key={field} className="block text-body-sm text-on-surface-variant">
                    {localize(label)}
                    <input
                      type="text"
                      maxLength={255}
                      value={formData[field] ?? ''}
                      placeholder={localize(hasValidMultiplier ? `${defaultBenefits[field]} (x${formData.priceMultiplier})` : 'Nhập hệ số hợp lệ để xem gợi ý')}
                      title={localize(hasValidMultiplier ? `Mặc định: ${defaultBenefits[field]} (Theo hệ số x${formData.priceMultiplier})` : undefined)}
                      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                      className="mt-1 w-full px-4 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-body-md text-primary placeholder:text-outline placeholder:opacity-70"
                    />
                  </label>
                ))}
                <p className="text-body-sm text-on-surface-variant">{localize("Chữ mờ là gợi ý theo hệ số. Nhấn ⚡ để điền rồi chỉnh sửa; đổi hệ số sẽ đặt lại cả 3 ô.")}</p>
              </fieldset>

              {/* Active Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-outline-variant">
                <div>
                  <span className="text-label-md font-bold text-primary block">{localize("Kích hoạt mở bán")}</span>
                  <span className="text-xs text-on-surface-variant">{localize("Cho phép hành khách nhìn thấy và chọn hạng vé này")}</span>
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
                >{localize("Hủy bỏ ")}</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-label-md shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                  <span>{localize(editingFare ? 'Lưu thay đổi' : 'Tạo hạng vé')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {deletingFare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container/30 text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-headline-sm font-bold text-primary">{localize("Xác nhận xóa hạng vé")}</h3>
              <p className="text-body-sm text-on-surface-variant">{localize("Bạn có chắc chắn muốn xóa vĩnh viễn hạng vé ")}<strong className="text-primary">{localize(deletingFare.name)}</strong> ({localize(deletingFare.code)}{localize(") không? Thao tác này không thể hoàn tác. ")}</p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingFare(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-label-md font-semibold text-on-surface-variant transition-colors"
              >{localize("Hủy bỏ ")}</button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-error hover:bg-error/90 text-on-error font-bold text-label-md shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
                <span>{localize("Xóa vĩnh viễn")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
