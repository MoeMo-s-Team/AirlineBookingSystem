import type { Airport } from '@/components/features/AirportPicker/types';

export const airports: Airport[] = [
  {
    code: 'HAN',
    name: 'Noi Bai International Airport',
    city: 'Hanoi',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'SGN',
    name: 'Tan Son Nhat International Airport',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'DAD',
    name: 'Da Nang International Airport',
    city: 'Da Nang',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'CXR',
    name: 'Cam Ranh International Airport',
    city: 'Cam Ranh',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'HPH',
    name: 'Cat Bi International Airport',
    city: 'Hai Phong',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'VDH',
    name: 'Dong Hoi Airport',
    city: 'Dong Hoi',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'THD',
    name: 'Tho Xuan Airport',
    city: 'Thanh Hoa',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'VII',
    name: 'Vinh Airport',
    city: 'Vinh',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'PQC',
    name: 'Phu Quoc International Airport',
    city: 'Phu Quoc',
    country: 'Vietnam',
    countryCode: 'VN',
  },
  {
    code: 'DLI',
    name: 'Lien Khuong Airport',
    city: 'Da Lat',
    country: 'Vietnam',
    countryCode: 'VN',
  },
];

export const popularAirports = [airports[0], airports[1], airports[2]]; // HAN, SGN, DAD
