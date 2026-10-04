import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { AuthLayout } from './AuthLayout';
import { MainLayout } from './MainLayout';
import { BookingLayout } from './BookingLayout';
import { AdminLayout } from './AdminLayout';

describe('Layouts', () => {
  it('renders AuthLayout with children and logo', () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <div data-testid="auth-content">Login Form</div>
        </AuthLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('auth-content')).toBeInTheDocument();
    expect(screen.getByText('SkyWing')).toBeInTheDocument();
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('renders MainLayout with header, children, and footer', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <MainLayout showFooter={true}>
            <div data-testid="main-content">Home Content</div>
          </MainLayout>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it('renders BookingLayout with progress stepper, summary, and action buttons', () => {
    render(
      <AuthProvider>
        <BookingProvider>
          <MemoryRouter>
            <BookingLayout currentStep={1}>
              <div data-testid="booking-content">Passenger Form</div>
            </BookingLayout>
          </MemoryRouter>
        </BookingProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('booking-content')).toBeInTheDocument();
    expect(screen.getByText('Price Summary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('renders AdminLayout with sidebar navigation links', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminLayout>
            <div data-testid="admin-content">Admin Dashboard Content</div>
          </AdminLayout>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(screen.getByText('SkyWing Admin Panel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Flights/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Services/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Fares/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });
});
