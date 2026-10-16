import React, { useEffect, useState, useCallback } from 'react';
import { fareApi, FareClassResponse } from '../../api/fareApi';
import { FareClass } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

export interface FareClassSelectorProps {
  readonly basePrice: number;
  readonly passengerCount?: number;
  readonly selectedFareId?: string | null;
  readonly onSelectFare: (fareClass: FareClass) => void;
}

const DEFAULT_BENEFITS: Record<string, { baggage: string; seatPitch: string; meal: string; changes: string; milesMultiplier: number }> = {
  ECONOMY: {
    baggage: '7kg cabin baggage, 20kg checked',
    seatPitch: 'Standard 30-31" legroom',
    meal: 'Complimentary snack & water',
    changes: 'Change fee applies ($25 + fare diff)',
    milesMultiplier: 1.0,
  },
  PREMIUM: {
    baggage: '10kg cabin baggage, 30kg checked',
    seatPitch: 'Extra 34-36" pitch with leg-rest',
    meal: 'Hot meal selection & beverages',
    changes: 'Free 1st change up to 24h before',
    milesMultiplier: 1.5,
  },
  BUSINESS: {
    baggage: '2x 10kg cabin, 40kg priority baggage',
    seatPitch: 'Full flat-bed seat with direct aisle access',
    meal: 'Chef-curated gourmet dining & fine wines',
    changes: 'Free unlimited booking changes',
    milesMultiplier: 2.5,
  },
};

export const FareClassSelector: React.FC<FareClassSelectorProps> = ({
  basePrice,
  passengerCount = 1,
  selectedFareId,
  onSelectFare,
}) => {
  const [fares, setFares] = useState<FareClassResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFares = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fareApi.getActiveFares();
      setFares(data);
    } catch (err: any) {
      if (err?.status === 500) {
        setError('Hệ thống máy chủ đang gặp sự cố khi xử lý dữ liệu hạng vé. Vui lòng thử lại sau.');
      } else if (err?.message?.includes('Failed to fetch') || err?.status === 0) {
        setError('Không thể kết nối đến máy chủ.');
      } else {
        setError(err?.message || 'Đã xảy ra lỗi khi tải danh sách hạng vé.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFares();
  }, [fetchFares]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-surface-container-low border border-outline-variant rounded-xl p-5 space-y-4">
            <div className="h-4 bg-outline-variant/40 rounded w-1/3"></div>
            <div className="h-6 bg-outline-variant/60 rounded w-2/3"></div>
            <div className="h-8 bg-outline-variant/80 rounded w-1/2"></div>
            <div className="space-y-2 pt-4 border-t border-outline-variant/40">
              <div className="h-3 bg-outline-variant/30 rounded"></div>
              <div className="h-3 bg-outline-variant/30 rounded w-4/5"></div>
              <div className="h-3 bg-outline-variant/30 rounded w-3/4"></div>
            </div>
            <div className="h-10 bg-outline-variant/50 rounded-lg mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-error-container/20 border border-error/30 text-center my-4">
        <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-[28px]">error</span>
        </div>
        <h4 className="text-headline-sm font-bold text-error mb-1">Không thể tải hạng vé</h4>
        <p className="text-body-sm text-on-surface-variant max-w-md mx-auto mb-4">{error}</p>
        <button
          type="button"
          onClick={fetchFares}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-label-md hover:bg-primary-container transition-all"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (fares.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant text-center my-4">
        <span className="material-symbols-outlined text-[32px] text-outline mb-2">info</span>
        <p className="text-body-sm text-on-surface-variant">
          Hiện tại chuyến bay này chưa có hạng vé khả dụng.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {fares.map(fare => {
        const code = fare.code.toUpperCase();
        const benefit = DEFAULT_BENEFITS[code] || DEFAULT_BENEFITS.ECONOMY;
        
        // Tính giá vé theo Strategy Pattern (BR-002)
        const calculatedPrice = fareApi.calculatePrice(basePrice, fare.priceMultiplier, 1);
        const totalPriceAllPassengers = fareApi.calculatePrice(basePrice, fare.priceMultiplier, passengerCount);

        const tierName = code === 'BUSINESS' ? 'Business' : code === 'PREMIUM' ? 'Premium Economy' : 'Economy';
        const isSelected = selectedFareId === String(fare.id) || selectedFareId === code || selectedFareId === fare.name;

        const fareClassObject: FareClass = {
          id: String(fare.id),
          tier: tierName as any,
          name: fare.name,
          price: calculatedPrice,
          baggage: benefit.baggage,
          seatPitch: benefit.seatPitch,
          meal: benefit.meal,
          changes: benefit.changes,
          cancellation: code === 'BUSINESS' ? 'Free refund up to 2h before departure' : 'Non-refundable',
          milesMultiplier: benefit.milesMultiplier,
          priorityBoarding: code !== 'ECONOMY',
          loungeAccess: code === 'BUSINESS',
          popular: code === 'PREMIUM',
        };

        return (
          <div
            key={fare.id}
            className={`flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 ${
              isSelected
                ? 'bg-surface-container-low border-primary ring-2 ring-primary/20 shadow-md'
                : 'bg-surface-container-lowest border-outline-variant hover:border-secondary hover:shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                    {tierName}
                  </span>
                  <h4 className="mt-0.5 text-headline-sm font-bold text-primary">
                    {fare.name}
                  </h4>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-bold text-[11px]">
                    x{fare.priceMultiplier}
                  </span>
                  {fareClassObject.popular && (
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-secondary shadow-sm">
                      Best Value
                    </span>
                  )}
                </div>
              </div>

              {/* Price display with Strategy Pattern */}
              <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums">
                <span className="text-headline-lg font-bold leading-none text-primary">
                  {formatCurrency(calculatedPrice)}
                </span>
                <span className="text-[11px] text-on-surface-variant">/ hành khách</span>
              </div>

              {passengerCount > 1 && (
                <span className="text-[11px] text-secondary font-medium block mt-1">
                  Tổng {passengerCount} khách: {formatCurrency(totalPriceAllPassengers)}
                </span>
              )}

              {/* Benefits */}
              <ul className="mt-5 space-y-2.5 border-t border-outline-variant/60 pt-4 text-body-sm leading-5 text-on-surface">
                <li className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">luggage</span>
                  <span>{fareClassObject.baggage}</span>
                </li>
                <li className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">airline_seat_recline_normal</span>
                  <span>{fareClassObject.seatPitch}</span>
                </li>
                <li className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">restaurant</span>
                  <span>{fareClassObject.meal}</span>
                </li>
                <li className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
                  <span className="material-symbols-outlined text-[16px] text-secondary">sync</span>
                  <span>{fareClassObject.changes}</span>
                </li>
              </ul>
            </div>

            {/* Select Button */}
            <div className="mt-6 pt-4 border-t border-outline-variant/60">
              <button
                type="button"
                onClick={() => onSelectFare(fareClassObject)}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-label-md font-bold transition-all ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border border-primary text-primary hover:bg-surface-container'
                }`}
              >
                {isSelected ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    <span>Đã chọn hạng này</span>
                  </>
                ) : (
                  <span>Chọn hạng {fare.name}</span>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
