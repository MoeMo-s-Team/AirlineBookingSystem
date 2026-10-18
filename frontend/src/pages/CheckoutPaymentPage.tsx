import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { PriceSummaryCard } from '../components/booking/PriceSummaryCard';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { bookingApi, type BookingDetail, type CreateBookingRequest } from '../api/bookingApi';
import { paymentApi } from '../api/paymentApi';
import type { ApiError } from '../api/apiClient';
import { formatCurrency } from '../utils/formatCurrency';

export type CheckoutState =
  | 'draft'
  | 'creating'
  | 'create-unknown'
  | 'persisted-pending'
  | 'paying'
  | 'payment-failed'
  | 'status-unknown'
  | 'cancelled'
  | 'confirmed';

export const CheckoutPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryBookingId = searchParams.get('bookingId');

  const {
    selectedFlight,
    selectedFareClass,
    passengers,
    selectedServices,
  } = useBookingFlow();

  const [checkoutState, setCheckoutState] = useState<CheckoutState>(
    queryBookingId ? 'persisted-pending' : 'draft'
  );
  const [persistedBooking, setPersistedBooking] = useState<BookingDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingPersisted, setIsLoadingPersisted] = useState(false);
  const bookingId = persistedBooking?.id ?? (queryBookingId ? Number(queryBookingId) : null);
  const hasValidBookingId = bookingId !== null && Number.isSafeInteger(bookingId) && bookingId > 0;

  const fetchPersistedBooking = useCallback(async (id: number): Promise<BookingDetail | null> => {
    try {
      setIsLoadingPersisted(true);
      setErrorMessage(null);
      const data = await bookingApi.getBooking(id);
      setPersistedBooking(data);
      if (data.status === 'CONFIRMED') {
        navigate(`/confirmation/${id}`);
      } else if (data.status === 'PAYMENT_FAILED') {
        setCheckoutState('payment-failed');
      } else if (data.status === 'CANCELLED') {
        setCheckoutState('cancelled');
      } else if (data.status === 'PENDING') {
        setCheckoutState('persisted-pending');
      } else {
        setCheckoutState('status-unknown');
        setErrorMessage('Không thể xác nhận trạng thái đơn đặt vé.');
      }
      return data;
    } catch (err: any) {
      setCheckoutState('status-unknown');
      setErrorMessage(err?.message || 'Không thể tải thông tin đơn đặt vé.');
      return null;
    } finally {
      setIsLoadingPersisted(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (queryBookingId) {
      fetchPersistedBooking(Number(queryBookingId));
    }
  }, [queryBookingId, fetchPersistedBooking]);

  // Handle Initial Booking Creation
  const handleCreateBooking = async () => {
    if (!selectedFlight || !selectedFareClass || passengers.length === 0) {
      setErrorMessage('Thông tin đặt vé chưa đầy đủ. Vui lòng quay lại kiểm tra.');
      return;
    }

    setCheckoutState('creating');
    setErrorMessage(null);
    sessionStorage.setItem('booking-create-outcome-unknown', 'true');

    try {
      const payload: CreateBookingRequest = {
        flightId: selectedFlight.id,
        fareClassId: selectedFareClass.id,
        passengers: passengers.map(p => ({
          fullName: p.fullName,
          dateOfBirth: p.dateOfBirth,
          passportNo: p.passportNo,
          phone: p.phone,
        })),
        services: selectedServices.map(s => ({
          serviceId: s.id,
          quantity: 1,
        })),
      };

      const created = await bookingApi.createBooking(payload);
      if (
        !created ||
        !Number.isSafeInteger(created.id) ||
        created.id <= 0 ||
        !created.bookingCode?.trim() ||
        created.status !== 'PENDING' ||
        typeof created.totalPrice !== 'number' ||
        !Number.isFinite(created.totalPrice)
      ) {
        throw new Error('Phản hồi tạo đơn đặt vé không hợp lệ.');
      }

      // Persist returned ID in URL before clearing marker
      setSearchParams({ bookingId: String(created.id) }, { replace: true });
      sessionStorage.removeItem('booking-create-outcome-unknown');
      setPersistedBooking(created);
      setCheckoutState('persisted-pending');
    } catch (err: any) {
      const apiErr = err as ApiError;
      const isKnown4xx = apiErr && typeof apiErr.status === 'number' && apiErr.status >= 400 && apiErr.status < 500;

      if (isKnown4xx) {
        // Known rejection can be corrected
        sessionStorage.removeItem('booking-create-outcome-unknown');
        setErrorMessage(apiErr.message || 'Yêu cầu đặt vé không hợp lệ.');
        setCheckoutState('draft');
      } else {
        // Timeout, connection drop, 5xx: unknown outcome
        setCheckoutState('create-unknown');
        navigate('/my-bookings?createOutcome=unknown', { replace: true });
      }
    }
  };

  // Handle Mock Payment Submission
  const handleProcessPayment = async () => {
    if (
      !hasValidBookingId ||
      bookingId === null ||
      isLoadingPersisted ||
      checkoutState !== 'persisted-pending' ||
      persistedBooking?.status !== 'PENDING'
    ) return;

    setCheckoutState('paying');
    setErrorMessage(null);

    try {
      const res = await paymentApi.processPayment({
        bookingId,
        paymentMethod: 'MOCK',
      });

      if (res.status === 'SUCCESS') {
        navigate(`/confirmation/${bookingId}`);
      } else if (res.status === 'FAILED') {
        setCheckoutState('payment-failed');
      } else {
        throw new Error('Phản hồi thanh toán không hợp lệ.');
      }
    } catch (err: any) {
      // 409 Conflict or network issue -> refetch booking to follow authoritative backend status
      try {
        const refreshed = await bookingApi.getBooking(bookingId);
        setPersistedBooking(refreshed);
        if (refreshed.status === 'CONFIRMED') {
          navigate(`/confirmation/${bookingId}`);
          return;
        }
        if (refreshed.status === 'PAYMENT_FAILED') {
          setCheckoutState('payment-failed');
          return;
        }
        if (refreshed.status === 'CANCELLED') {
          setCheckoutState('cancelled');
          setErrorMessage('Đơn đặt vé đã bị hủy và không thể thanh toán.');
          return;
        }
        if (refreshed.status === 'PENDING') {
          setCheckoutState('persisted-pending');
          setErrorMessage('Đã xảy ra xung đột khi thanh toán. Trạng thái hiện tại: PENDING');
          return;
        }
        setCheckoutState('status-unknown');
        setErrorMessage('Không thể xác nhận trạng thái đơn đặt vé.');
      } catch {
        setCheckoutState('status-unknown');
        setErrorMessage('Không thể xác nhận trạng thái thanh toán.');
      }
    }
  };

  const isPersistedMode = Boolean(queryBookingId || persistedBooking);
  const activeAmount = persistedBooking?.totalPrice ?? null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        {/* Stepper Header */}
        <section className="bg-surface-container-low border-b border-outline-variant py-4 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/services"
              className="text-label-md font-semibold text-primary hover:text-secondary flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Services</span>
            </Link>

            {/* Stepper Navigation */}
            <div className="flex items-center gap-2 sm:gap-6 text-label-md">
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center text-xs font-bold">✓</span>
                <span className="hidden sm:inline font-semibold">1. Flight</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center text-xs font-bold">✓</span>
                <span className="hidden sm:inline font-semibold">2. Passenger</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center text-xs font-bold">✓</span>
                <span className="hidden sm:inline font-semibold">3. Services</span>
              </div>
              <span className="text-outline-variant">›</span>
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">4</span>
                <span>4. Payment</span>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Body */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Payment Interaction Column */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h1 className="text-headline-lg font-bold text-primary tracking-tight">
                  Checkout & Payment
                </h1>
                <p className="text-body-md text-on-surface-variant mt-1">
                  Xác nhận đơn đặt vé và xử lý thanh toán qua cổng thử nghiệm Mock Gateway.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-error/30 bg-error-container/30 p-4 text-on-error-container flex items-start gap-2">
                  <span className="material-symbols-outlined text-error">error</span>
                  <div>
                    <p className="font-semibold">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Terminal Payment Failure Notice */}
              {checkoutState === 'payment-failed' && (
                <div className="rounded-2xl border border-error bg-error-container/20 p-6 text-on-surface space-y-3">
                  <div className="flex items-center gap-2 text-error font-bold text-headline-sm">
                    <span className="material-symbols-outlined text-[28px]">cancel</span>
                    <span>Thanh toán thất bại (PAYMENT_FAILED)</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant">
                    Giao dịch thanh toán không thành công. Đơn đặt vé này đã chuyển sang trạng thái thất bại.
                    Vui lòng bắt đầu một hành trình đặt vé mới.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container transition-colors"
                  >
                    <span>Tìm chuyến bay mới</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              )}

              {/* Draft Mode: Confirm & Create Booking */}
              {!isPersistedMode && checkoutState !== 'payment-failed' && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-headline-sm font-bold text-primary">
                    Xác nhận thông tin đặt vé
                  </h3>
                  <p className="text-body-md text-on-surface-variant">
                    Nhấn nút bên dưới để tạo đơn đặt vé chính thức trên hệ thống. Sau khi tạo thành công, mã đặt chỗ sẽ được cấp phát và bạn có thể tiến hành thanh toán.
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateBooking}
                    disabled={checkoutState === 'creating'}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {checkoutState === 'creating' ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        <span>Đang tạo đơn đặt vé...</span>
                      </>
                    ) : (
                      <span>Confirm & Create Booking</span>
                    )}
                  </button>
                </div>
              )}

              {/* Persisted Mode: Show Pending Booking & Demo Gateway */}
              {isPersistedMode && checkoutState !== 'payment-failed' && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                    <div>
                      <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">
                        Mã đơn đặt vé
                      </span>
                      <h3 className="text-headline-md font-bold text-primary font-mono">
                        {persistedBooking?.bookingCode || `ID: ${queryBookingId}`}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-label-sm font-bold bg-amber-100 text-amber-800">
                      {checkoutState === 'status-unknown'
                        ? 'UNKNOWN'
                        : persistedBooking?.status || 'Đang xác minh'}
                    </span>
                  </div>

                  {activeAmount != null && (
                    <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                      <span className="text-label-md font-semibold text-on-surface-variant">
                        Tổng tiền cần thanh toán (xác nhận từ hệ thống):
                      </span>
                      <span className="text-headline-md font-bold text-primary">
                        {formatCurrency(activeAmount)}
                      </span>
                    </div>
                  )}

                  {checkoutState === 'status-unknown' && (
                    <div className="space-y-3">
                      <p className="text-body-sm text-on-surface-variant">
                        Chưa xác minh được trạng thái. Thanh toán đang tạm dừng; hãy kiểm tra lại trước khi tiếp tục.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {hasValidBookingId && bookingId !== null && (
                          <button
                            type="button"
                            onClick={() => fetchPersistedBooking(bookingId)}
                            disabled={isLoadingPersisted}
                            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold disabled:opacity-50"
                          >
                            {isLoadingPersisted ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái lại'}
                          </button>
                        )}
                        <Link to="/my-bookings" className="px-5 py-2.5 rounded-xl border border-outline text-primary font-label-md font-bold">
                          Xem đơn đặt vé
                        </Link>
                      </div>
                    </div>
                  )}

                  {checkoutState === 'cancelled' && (
                    <div className="space-y-3">
                      <p className="text-body-sm text-on-surface-variant">
                        Đơn đặt vé đã bị hủy và không thể thanh toán.
                      </p>
                      <Link to="/my-bookings" className="inline-flex px-5 py-2.5 rounded-xl border border-outline text-primary font-label-md font-bold">
                        Xem đơn đặt vé
                      </Link>
                    </div>
                  )}

                  {(checkoutState === 'persisted-pending' || checkoutState === 'paying') && persistedBooking?.status === 'PENDING' && (
                    <div className="space-y-3">
                      <h4 className="text-label-lg font-bold text-primary">
                        Cổng thanh toán thử nghiệm (Mock Gateway)
                      </h4>
                      <p className="text-body-sm text-on-surface-variant">
                        Đây là cổng thanh toán mô phỏng phục vụ thử nghiệm tính năng. Không yêu cầu nhập thẻ tín dụng hay chuyển khoản thực tế.
                      </p>
                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        disabled={checkoutState === 'paying' || isLoadingPersisted}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {checkoutState === 'paying' ? (
                          <>
                            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                            <span>Đang xử lý thanh toán...</span>
                          </>
                        ) : (
                          <span>Pay with Mock Gateway</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Preview Column */}
            <div className="lg:col-span-4">
              <PriceSummaryCard
                flight={selectedFlight}
                fareClass={selectedFareClass}
                passengerCount={passengers.length}
                selectedServices={selectedServices}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
