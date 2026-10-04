export interface PassengerType {
  id: string;
  label: string;
  ageRange: string;
  count: number;
}

export const passengerTypes: PassengerType[] = [
  { id: 'adult', label: 'Adults', ageRange: '12+ years', count: 1 },
  { id: 'child', label: 'Children', ageRange: '2-11 years', count: 0 },
  { id: 'infant', label: 'Infants', ageRange: 'Under 2 years', count: 0 },
];
