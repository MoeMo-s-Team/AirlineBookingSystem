export interface FareClass {
  id: string;
  code: string;
  name: string;
  description: string;
  amenities: string[];
  priceMultiplier: number;
}

export const fareClasses: FareClass[] = [
  {
    id: 'fare-1',
    code: 'ECO',
    name: 'Economy Class',
    description: 'Comfortable travel with essential amenities',
    amenities: [
      'Personal entertainment system',
      'Complimentary snacks and beverages',
      'Standard baggage allowance (23kg)',
      'Seat selection available',
    ],
    priceMultiplier: 1.0,
  },
  {
    id: 'fare-2',
    code: 'PREM',
    name: 'Premium Economy',
    description: 'Enhanced comfort with priority services',
    amenities: [
      'Wider seats with extra legroom',
      'Priority check-in',
      'Premium meal service',
      'Increased baggage allowance (32kg)',
      'Priority boarding',
    ],
    priceMultiplier: 1.5,
  },
  {
    id: 'fare-3',
    code: 'BIZ',
    name: 'Business Class',
    description: 'Full business experience with premium perks',
    amenities: [
      'Lie-flat seats',
      'Dedicated check-in counter',
      'Lounge access',
      'Gourmet dining with wine',
      'Two pieces of baggage (32kg each)',
      'Priority everything',
    ],
    priceMultiplier: 2.8,
  },
  {
    id: 'fare-4',
    code: 'FIRST',
    name: 'First Class',
    description: 'The pinnacle of luxury travel with private suites',
    amenities: [
      'Private suite with sliding doors',
      'Chauffeured airport transfer',
      'Michelin-star inspired dining',
      'Unlimited baggage allowance',
      'VIP lounge and spa access',
    ],
    priceMultiplier: 4.5,
  },
];
