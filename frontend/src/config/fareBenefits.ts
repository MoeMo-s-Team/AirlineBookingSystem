export interface FareBenefitDetails {
  baggage: string;
  seatPitch: string;
  meal: string;
  changes: string;
  cancellation: string;
  milesMultiplier: number;
  priorityBoarding: boolean;
  loungeAccess: boolean;
  popular?: boolean;
}

export const BASE_BENEFITS: Record<string, FareBenefitDetails> = {
  ECONOMY: {
    baggage: '7kg cabin baggage, 20kg checked',
    seatPitch: 'Standard 30-31" legroom',
    meal: 'Complimentary snack & water',
    changes: 'Change fee applies ($25 + fare diff)',
    cancellation: 'Non-refundable',
    milesMultiplier: 1.0,
    priorityBoarding: false,
    loungeAccess: false,
  },
  PREMIUM: {
    baggage: '10kg cabin baggage, 30kg checked',
    seatPitch: 'Extra 34-36" pitch with leg-rest',
    meal: 'Hot meal selection & beverages',
    changes: 'Free 1st change up to 24h before',
    cancellation: 'Refund fee applies ($35)',
    milesMultiplier: 1.5,
    priorityBoarding: true,
    loungeAccess: false,
    popular: true,
  },
  BUSINESS: {
    baggage: '2x 10kg cabin, 40kg priority baggage',
    seatPitch: 'Full flat-bed seat with direct aisle access',
    meal: 'Chef-curated gourmet dining & fine wines',
    changes: 'Free unlimited booking changes',
    cancellation: 'Free refund up to 2h before departure',
    milesMultiplier: 2.5,
    priorityBoarding: true,
    loungeAccess: true,
  },
  FIRST: {
    baggage: '2x 15kg cabin, 50kg VIP baggage',
    seatPitch: 'Private suite with sliding door & 180° flat bed',
    meal: 'Fine dining à la carte & vintage champagne',
    changes: 'Free unlimited changes anytime',
    cancellation: '100% full refund anytime',
    milesMultiplier: 3.5,
    priorityBoarding: true,
    loungeAccess: true,
    popular: false,
  },
};

/**
 * Tự động suy diễn quyền lợi hạng vé linh hoạt dựa trên mã code hoặc hệ số giá.
 * Hỗ trợ các hạng vé mới tạo từ Admin (như FIRST, VIP, PROMO...)
 */
export function getFareBenefits(code: string, priceMultiplier: number = 1.0): FareBenefitDetails {
  const normalized = (code || '').toUpperCase().trim();

  // 1. Khớp theo mã định danh chuẩn
  if (normalized.includes('FIRST')) return BASE_BENEFITS.FIRST;
  if (normalized.includes('BIZ') || normalized.includes('BUSINESS')) return BASE_BENEFITS.BUSINESS;
  if (normalized.includes('PREM') || normalized.includes('FLEX')) return BASE_BENEFITS.PREMIUM;
  if (normalized.includes('ECO')) return BASE_BENEFITS.ECONOMY;

  // 2. Suy diễn theo hệ số giá nếu Admin đặt tên tùy ý
  if (priceMultiplier >= 3.0) return BASE_BENEFITS.FIRST;
  if (priceMultiplier >= 2.0) return BASE_BENEFITS.BUSINESS;
  if (priceMultiplier >= 1.3) return BASE_BENEFITS.PREMIUM;
  return BASE_BENEFITS.ECONOMY;
}
