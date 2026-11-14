import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getLanguage, getLocale, localize, setLanguage } from './index';
import { TopNavBar } from '../components/layout/TopNavBar';
import { AdminHeader } from '../components/layout/AdminHeader';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminFareClassesPage } from '../pages/admin/AdminFareClassesPage';
import { fareApi } from '../api/fareApi';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({
  user: { fullName: 'Nguyen Van A', email: 'a@example.com', role: 'ADMIN' },
  isAuthenticated: true, signOut: vi.fn(),
}) }));
vi.mock('../components/notification/NotificationBell', () => ({ NotificationBell: () => null }));
vi.mock('../api/fareApi', () => ({ fareApi: { getAllFares: vi.fn() } }));

beforeEach(() => { localStorage.clear(); setLanguage('en'); });
afterEach(() => setLanguage('en'));

describe('Application language', () => {
  it('defaults to English and switches user navigation, admin header and sidebar together', () => {
    render(<MemoryRouter>
      <TopNavBar />
      <AdminHeader title="Fare Classes Management" subtitle="Manage routes, departure times, fares and available seats." />
      <AdminSidebar />
    </MemoryRouter>);
    expect(getLanguage()).toBe('en');
    expect(screen.getByRole('link', { name: 'Book Flight' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fare Classes Management' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Switch to Vietnamese' })[0]);
    expect(screen.getByRole('link', { name: 'Đặt vé' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quản lý hạng vé' })).toBeInTheDocument();
    expect(screen.getByText('Quản lý chuyến bay')).toBeInTheDocument();
    expect(screen.getAllByText('Nguyen Van A')).toHaveLength(2);
    expect(document.documentElement.lang).toBe('vi');
    expect(localStorage.getItem('skywing.language')).toBe('vi');
    expect(getLocale()).toBe('vi-VN');
    fireEvent.click(screen.getAllByRole('button', { name: 'Chuyển sang tiếng Anh' })[0]);
    expect(screen.getByRole('link', { name: 'Book Flight' })).toBeInTheDocument();
    expect(getLocale()).toBe('en-US');
  });

  it('keeps an open admin form and typed values when switching language', async () => {
    vi.mocked(fareApi.getAllFares).mockResolvedValue([]);
    render(<MemoryRouter><AdminFareClassesPage /></MemoryRouter>);
    await waitFor(() => expect(fareApi.getAllFares).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /Add fare class/ }));
    fireEvent.change(screen.getByLabelText('Fare class name'), { target: { value: 'My custom fare' } });
    fireEvent.change(screen.getByLabelText('Price multiplier'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Vietnamese' }));
    expect(screen.getByLabelText('Tên hạng vé')).toHaveValue('My custom fare');
    expect(screen.getByLabelText('Hệ số nhân giá')).toHaveValue(4);
    expect(screen.getByLabelText('Hành lý')).toHaveAttribute('placeholder', '2 kiện xách tay 15kg, 50kg hành lý VIP (x4)');
    expect(screen.getByRole('button', { name: '⚡ Tự động điền theo hệ số' })).toBeInTheDocument();
  });

  it('translates errors and dynamic messages without changing unknown account or service data', () => {
    expect(localize('Không thể xóa chuyến bay đã có đặt vé')).toBe('A flight with existing bookings cannot be deleted');
    expect(localize('Đã cập nhật hạng vé "CUSTOM-01" thành công.')).toBe('Fare class "CUSTOM-01" updated successfully.');
    expect(localize('Dịch vụ hành lý tiêu chuẩn cao cấp giúp chuyến bay của bạn thoải mái và trọn vẹn hơn.')).toBe('Premium Baggage service for a more comfortable and enjoyable flight.');
    expect(localize('Tên riêng do admin nhập')).toBe('Tên riêng do admin nhập');
    setLanguage('vi');
    expect(localize('Notifications, 3 unread')).toBe('Thông báo, 3 chưa đọc');
    expect(localize('Your booking BK123 has been confirmed.')).toBe('Đơn đặt vé BK123 đã được xác nhận.');
    expect(localize('2x 15kg cabin, 50kg VIP (x4)')).toBe('2 kiện xách tay 15kg, 50kg hành lý VIP (x4)');
  });

  it('restores the saved language when the application is loaded again', async () => {
    localStorage.setItem('skywing.language', 'vi');
    vi.resetModules();
    const reloaded = await import('./index');
    expect(reloaded.getLanguage()).toBe('vi');
    expect(reloaded.localize('Book Flight')).toBe('Đặt vé');
    reloaded.setLanguage('en');
  });
});
