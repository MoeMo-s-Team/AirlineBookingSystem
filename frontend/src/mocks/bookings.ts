export interface MockBooking {
  id: string;
  bookingRef: string;
  userId: string;
  flight: {
    number: string;
    route: string;
    date: string;
    departure: { time: string; airport: string };
    arrival: { time: string; airport: string };
    cabinClass: string;
  };
  passenger: {
    name: string;
    type: string;
    seat: string;
  };
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalAmount: number;
  createdAt: string;
}

export const mockBookings: MockBooking[] = [
  {
    id: 'book-1',
    bookingRef: 'BK-ABC123',
    userId: 'user-1',
    flight: {
      number: 'VN1234',
      route: 'HAN → SGN',
      date: '2026-06-15',
      departure: { time: '06:00', airport: 'HAN' },
      arrival: { time: '08:30', airport: 'SGN' },
      cabinClass: 'Business',
    },
    passenger: {
      name: 'Nguyen Van An',
      type: 'Adult',
      seat: '12A',
    },
    status: 'confirmed',
    totalAmount: 9688000,
    createdAt: '2026-01-10T10:30:00Z',
  },
  {
    id: 'book-2',
    bookingRef: 'BK-DEF456',
    userId: 'user-1',
    flight: {
      number: 'VN5678',
      route: 'SGN → DAD',
      date: '2026-02-20',
      departure: { time: '14:00', airport: 'SGN' },
      arrival: { time: '16:15', airport: 'DAD' },
      cabinClass: 'Economy',
    },
    passenger: {
      name: 'Nguyen Van An',
      type: 'Adult',
      seat: '24C',
    },
    status: 'completed',
    totalAmount: 2450000,
    createdAt: '2026-01-05T08:15:00Z',
  },
  {
    id: 'book-3',
    bookingRef: 'BK-GHI789',
    userId: 'user-1',
    flight: {
      number: 'VN160',
      route: 'HAN → DAD',
      date: '2026-07-01',
      departure: { time: '07:30', airport: 'HAN' },
      arrival: { time: '08:50', airport: 'DAD' },
      cabinClass: 'Economy',
    },
    passenger: {
      name: 'Nguyen Van An',
      type: 'Adult',
      seat: '15B',
    },
    status: 'pending',
    totalAmount: 1950000,
    createdAt: '2026-01-14T14:20:00Z',
  },
  {
    id: 'book-4',
    bookingRef: 'BK-JKL012',
    userId: 'user-3',
    flight: {
      number: 'VN1820',
      route: 'SGN → PQC',
      date: '2026-04-10',
      departure: { time: '10:30', airport: 'SGN' },
      arrival: { time: '11:35', airport: 'PQC' },
      cabinClass: 'Economy',
    },
    passenger: {
      name: 'Test User',
      type: 'Adult',
      seat: '08D',
    },
    status: 'confirmed',
    totalAmount: 1650000,
    createdAt: '2026-01-12T11:00:00Z',
  },
  {
    id: 'book-5',
    bookingRef: 'BK-MNO345',
    userId: 'user-1',
    flight: {
      number: 'VN1238',
      route: 'HAN → SGN',
      date: '2026-03-01',
      departure: { time: '13:00', airport: 'HAN' },
      arrival: { time: '15:30', airport: 'SGN' },
      cabinClass: 'Business',
    },
    passenger: {
      name: 'Nguyen Van An',
      type: 'Adult',
      seat: '03A',
    },
    status: 'cancelled',
    totalAmount: 8900000,
    createdAt: '2025-12-20T09:45:00Z',
  },
];
