export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'nguyenvana@email.com',
    password: 'password123',
    name: 'Nguyen Van An',
    phone: '0912345678',
    role: 'customer',
    tier: 'Gold',
  },
  {
    id: 'user-2',
    email: 'admin@skywing.vn',
    password: 'admin123',
    name: 'Admin User',
    phone: '0999999999',
    role: 'admin',
  },
  {
    id: 'user-3',
    email: 'test@email.com',
    password: 'test123',
    name: 'Test User',
    phone: '0888888888',
    role: 'customer',
  },
];
