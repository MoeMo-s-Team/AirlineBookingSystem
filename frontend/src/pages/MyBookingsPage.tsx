import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { BookingCard } from '../components/booking/BookingCard';
import { BookingDossierModal } from '../components/booking/BookingDossierModal';
import { useAuth } from '../context/AuthContext';
import { bookingApi, type BookingSummary, type BookingDetail, type BookingStatus } from '../api/bookingApi';

export interface MyBookingsPageProps {
  readonly initialBookings?: readonly BookingSummary[];
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const isUnknownOutcome =
    searchParams.get('createOutcome') === 'unknown' ||
    (typeof window !== 'undefined' && sessionStorage.getItem('booking-create-outcome-unknown') === 'true');

  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | BookingStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isDossierLoading, setIsDossierLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    bookingApi
      .getMyBookings()
      .then((data) => {
        if (!cancelled) {
          setBookings(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách đặt chỗ.');
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
  }, []);

  const handleOpenDossier = (summary: BookingSummary) => {
    setIsDossierOpen(true);
    setIsDossierLoading(true);
    setSelectedBooking(null);

    bookingApi
      .getBooking(summary.id)
      .then((detail) => {
        setSelectedBooking(detail);
      })
      .catch(() => {
        // Fallback to summary fields if detail call fails
        setSelectedBooking(summary as any);
      })
      .finally(() => {
        setIsDossierLoading(false);
      });
  };

  const handleCancelBooking = async (idOrCode: number | string) => {
    const numericId =
      typeof idOrCode === 'number'
        ? idOrCode
        : bookings.find((b) => b.bookingCode === idOrCode || (b as any).pnr === idOrCode)?.id;

    if (!numericId) return;

    try {
      const res = await bookingApi.cancelBooking(numericId);
      setBookings((prev) =>
        prev.map((b) => (b.id === numericId ? { ...b, status: res.status } : b))
      );
      if (selectedBooking && selectedBooking.id === numericId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: res.status } : prev));
      }
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 409) {
        try {
          const refreshed = await bookingApi.getBooking(numericId);
          setBookings((prev) =>
            prev.map((b) => (b.id === numericId ? { ...b, status: refreshed.status } : b))
          );
          if (selectedBooking && selectedBooking.id === numericId) {
            setSelectedBooking(refreshed);
          }
        } catch {
          // Ignore secondary refresh errors
        }
      }
    }
  };

  const filteredBookings = bookings.filter((b) => {
    // Tab filter
    if (activeTab !== 'ALL' && b.status !== activeTab) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesCode = (b.bookingCode || '').toLowerCase().includes(q);
      const matchesFlight = (b.flight?.flightNumber || '').toLowerCase().includes(q);
      const matchesOrigin = (b.flight?.originAirport || '').toLowerCase().includes(q);
      const matchesDest = (b.flight?.destinationAirport || '').toLowerCase().includes(q);
      return matchesCode || matchesFlight || matchesOrigin || matchesDest;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        {/* Page Header */}
        <section className="bg-surface-container-low border-b border-outline-variant py-8 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
                  Passenger Self-Service
                </span>
                {isAuthenticated && user && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-primary">
                    Hội Viên {user.fullName || (user as any).name}
                  </span>
                )}
              </div>
              <h1 className="text-headline-lg font-bold text-primary tracking-tight">
                My Bookings & Journeys
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Quản lý các chuyến bay đã đặt, tra cứu thông tin mã đặt chỗ và theo dõi trạng thái.
              </p>
            </div>

            <Link
              to="/"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-lg font-bold shadow-md transition-all self-start sm:self-center"
            >
              Đặt chuyến bay mới
            </Link>
          </div>
        </section>

        {/* Manual Verification Warning Banner for Unknown Create Outcome */}
        {isUnknownOutcome && (
          <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-900 dark:text-amber-200">
              <span className="material-symbols-outlined text-[24px] text-amber-600 mt-0.5">
                warning
              </span>
              <div>
                <span className="text-label-lg font-bold block">
                  Đơn đặt vé chưa rõ kết quả tạo (Manual Verification Required)
                </span>
                <span className="text-body-sm block mt-0.5">
                  Đơn đặt vé vừa tạo đang được hệ thống xử lý hoặc kết nối bị gián đoạn. Vui lòng kiểm tra lại danh sách đặt chỗ bên dưới và không tạo lại đơn mới ngay để tránh thanh toán trùng lặp.
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Search & Tabs */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant overflow-x-auto">
              {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {tab === 'ALL' ? 'Tất cả' : tab}
                </button>
              ))}
            </div>

            {/* Code Search Box */}
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm theo mã đặt chỗ, chuyến bay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-body-md text-on-surface-variant">Đang tải danh sách đặt chỗ...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-error/30 bg-error-container/20 p-6 text-center">
              <p className="text-title-sm font-bold text-error mb-1">Không thể tải danh sách đặt chỗ</p>
              <p className="text-body-sm text-on-surface-variant">{error}</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onManage={handleOpenDossier}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-3 text-outline">
                <span className="material-symbols-outlined text-[28px]">flight_takeoff</span>
              </div>
              <h3 className="text-headline-sm font-bold text-primary mb-1">
                Không tìm thấy đặt chỗ nào
              </h3>
              <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto mb-6">
                Bạn chưa có đơn đặt vé nào phù hợp với bộ lọc tìm kiếm hiện tại.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold"
              >
                Tìm chuyến bay ngay
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Booking Dossier Modal */}
      <BookingDossierModal
        booking={selectedBooking}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onCancelBooking={handleCancelBooking}
        isLoading={isDossierLoading}
      />
    </div>
  );
};
