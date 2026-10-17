import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BookingDossierModal } from '../../components/booking/BookingDossierModal';
import {
  bookingApi,
  type AdminBookingListRecord,
  type AdminBookingPagination,
  type BookingStatus,
} from '../../api/bookingApi';

export interface AdminBookingsPageProps {
  readonly onBookingSelected?: (booking: AdminBookingListRecord) => void;
}

export const AdminBookingsPage: React.FC<AdminBookingsPageProps> = () => {
  const [records, setRecords] = useState<AdminBookingListRecord[]>([]);
  const [pagination, setPagination] = useState<AdminBookingPagination>({
    total: 0,
    page: 0,
    size: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AdminBookingListRecord | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    bookingApi
      .getAdminBookings({
        page,
        size: 10,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      })
      .then((res) => {
        if (!cancelled) {
          setRecords(res.data);
          setPagination(res.pagination);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const status = (err as any)?.status;
          let message = err?.message || (err instanceof Error ? err.message : 'Không thể tải danh sách đặt chỗ');
          if (status === 403) {
            message = 'Tài khoản hiện tại không có quyền Quản trị viên (403 Forbidden). Vui lòng đăng nhập bằng tài khoản Admin.';
          }
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter]);

  const handleStatusFilterChange = (newStatus: 'ALL' | BookingStatus) => {
    setStatusFilter(newStatus);
    setPage(0);
  };

  const filteredRecords = records.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const codeMatch = (b.bookingCode || '').toLowerCase().includes(q);
    const paxMatch = (b.passengers || []).some((p) => (p.fullName || '').toLowerCase().includes(q));
    const userMatch =
      (b.user?.fullName || '').toLowerCase().includes(q) ||
      (b.user?.email || '').toLowerCase().includes(q);
    const flightMatch = (b.flight?.flightNumber || '').toLowerCase().includes(q);
    return codeMatch || paxMatch || userMatch || flightMatch;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="Global Bookings & PNR Registry"
          subtitle="Quản lý danh sách đặt chỗ hành khách toàn hệ thống"
          searchValue={search}
          onSearch={setSearch}
        />

        <main className="flex-1 p-8 space-y-8">
          {/* Table Container */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-label-md font-bold text-primary uppercase tracking-wider">
                  Danh sách đặt chỗ
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-label-sm font-semibold">
                  {pagination.total} Đơn
                </span>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-label-sm text-outline font-semibold">Trạng thái:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-label-sm text-on-surface focus:outline-none"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                </select>
              </div>
            </div>

            {/* Error or Loading */}
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-body-md text-on-surface-variant">Đang tải danh sách đặt chỗ...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-error">{error}</div>
            ) : (
              <>
                {/* Bookings Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-outline uppercase tracking-wider font-semibold">
                        <th className="py-3.5 px-6">Mã đặt chỗ</th>
                        <th className="py-3.5 px-6">Khách hàng đặt vé</th>
                        <th className="py-3.5 px-6">Hành khách bay</th>
                        <th className="py-3.5 px-6">Chuyến bay</th>
                        <th className="py-3.5 px-6">Ngày tạo</th>
                        <th className="py-3.5 px-6">Tổng tiền</th>
                        <th className="py-3.5 px-6">Trạng thái</th>
                        <th className="py-3.5 px-6 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                            Không tìm thấy bản ghi nào.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((b) => {
                          const customerName = b.user?.fullName || 'Khách vãng lai';
                          const passengerNames = b.passengers && b.passengers.length > 0
                            ? b.passengers.map((p) => p.fullName).filter(Boolean).join(', ')
                            : (b.passengers?.[0]?.fullName || 'Chưa cập nhật');
                          const flightInfo = b.flight?.flightNumber
                            ? `${b.flight.flightNumber} (${b.flight.originAirport || ''} → ${
                                b.flight.destinationAirport || ''
                              })`
                            : 'N/A';
                          const createdDate = b.createdAt
                            ? new Date(b.createdAt).toLocaleDateString('vi-VN')
                            : 'N/A';
                          const priceStr =
                            typeof b.totalPrice === 'number'
                              ? `${b.totalPrice.toLocaleString('vi-VN')} ₫`
                              : '0 ₫';

                          return (
                            <tr
                              key={b.id}
                              className="hover:bg-surface-container-low/50 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <span className="font-mono font-bold text-headline-sm text-primary">
                                  {b.bookingCode || b.id}
                                </span>
                              </td>

                              {/* Khách hàng sở hữu / đặt / hủy đơn vé */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px] text-primary">account_circle</span>
                                  <span className="font-bold text-primary">
                                    {customerName}
                                  </span>
                                </div>
                                {b.user?.email && (
                                  <span className="text-[12px] text-on-surface-variant block font-mono mt-0.5">
                                    {b.user.email}
                                  </span>
                                )}
                                {b.status === 'CANCELLED' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 rounded-full text-[11px] font-bold bg-error-container/30 text-error">
                                    <span className="material-symbols-outlined text-[12px]">cancel</span>
                                    Đã hủy bởi khách
                                  </span>
                                )}
                              </td>

                              {/* Hành khách bay */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px] text-outline">group</span>
                                  <span className="font-semibold text-on-surface">
                                    {passengerNames}
                                  </span>
                                </div>
                                {b.passengers && b.passengers.length > 1 && (
                                  <span className="text-[11px] text-secondary font-medium block mt-0.5">
                                    ({b.passengers.length} hành khách)
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-6">
                                <span className="font-semibold text-primary block">
                                  {flightInfo}
                                </span>
                                {b.fareClass?.name && (
                                  <span className="text-[12px] text-on-surface-variant block">
                                    {b.fareClass.name}
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-6 font-medium">{createdDate}</td>

                              <td className="py-4 px-6 font-bold text-primary">{priceStr}</td>

                              <td className="py-4 px-6">
                                {b.status && <StatusBadge status={b.status as any} />}
                              </td>

                              <td className="py-4 px-6 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRecord(b);
                                    setIsDossierOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-label-sm font-semibold text-primary transition-colors"
                                >
                                  Dossier
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-label-sm text-on-surface-variant">
                    Trang {pagination.page + 1} / {Math.max(1, pagination.totalPages)} ({pagination.total} đặt chỗ)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant disabled:opacity-40 hover:bg-surface-container text-label-sm font-semibold text-primary transition-colors"
                    >
                      Trước
                    </button>
                    <button
                      type="button"
                      disabled={page >= pagination.totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant disabled:opacity-40 hover:bg-surface-container text-label-sm font-semibold text-primary transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Dossier Modal (List record fields only, no detail call, no refund/cancel action) */}
      <BookingDossierModal
        booking={selectedRecord}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </div>
  );
};
