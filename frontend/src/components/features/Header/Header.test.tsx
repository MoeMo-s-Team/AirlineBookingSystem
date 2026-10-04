import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const renderHeader = (props = {}) => {
  return render(
    <BrowserRouter>
      <Header {...props} />
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('renders logo', () => {
    renderHeader();
    expect(screen.getByText('SkyWing')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderHeader();
    expect(screen.getByText('Book Flight')).toBeInTheDocument();
    expect(screen.getByText('Manage Booking')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Flight Status')).toBeInTheDocument();
  });

  it('highlights active navigation item based on activeNav prop', () => {
    renderHeader({ activeNav: 'manage-booking' });
    const manageLink = screen.getByText('Manage Booking');
    expect(manageLink.className).toContain('bg-surface-container');
    expect(manageLink.className).toContain('text-primary');
  });

  it('highlights active navigation item based on location pathname', () => {
    render(
      <MemoryRouter initialEntries={['/check-in']}>
        <Header />
      </MemoryRouter>
    );
    const checkInLink = screen.getByText('Check-in');
    expect(checkInLink.className).toContain('bg-surface-container');
    expect(checkInLink.className).toContain('text-primary');
  });

  it('shows sign in button when no user', () => {
    renderHeader();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows user avatar when user provided', () => {
    renderHeader({ user: { name: 'Nguyen Van An' } });
    expect(screen.getByText('NV')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    renderHeader();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('calls onNotificationClick when notification button is clicked', () => {
    const handleNotificationClick = vi.fn();
    renderHeader({ onNotificationClick: handleNotificationClick });
    const notificationBtn = screen.getByLabelText('Notifications');
    expect(notificationBtn).toBeInTheDocument();
    fireEvent.click(notificationBtn);
    expect(handleNotificationClick).toHaveBeenCalledTimes(1);
  });
});
