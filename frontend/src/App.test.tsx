import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { App, ProtectedRoute, AdminRoute, NotFoundPage } from './App';
import { DashboardPage } from './pages/booking/DashboardPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CheckInPage } from './pages/user/CheckInPage';
import { FlightStatusPage } from './pages/user/FlightStatusPage';
import { MyBookingsPage } from './pages/user/MyBookingsPage';
import { BookingDetailsPage } from './pages/user/BookingDetailsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

function renderAppRoute(initialRoute: string) {
  return render(
    <AuthProvider>
      <BookingProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/check-in" element={<CheckInPage />} />
            <Route path="/status" element={<FlightStatusPage />} />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/:id"
              element={
                <ProtectedRoute>
                  <BookingDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </BookingProvider>
    </AuthProvider>
  );
}

describe('App Routing Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders DashboardPage at root path /', () => {
    renderAppRoute('/');
    expect(screen.getByRole('heading', { name: /Search and Book Flights Across Classes/i })).toBeInTheDocument();
  });

  it('renders LoginPage at /login', () => {
    renderAppRoute('/login');
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
  });

  it('renders RegisterPage at /register', () => {
    renderAppRoute('/register');
    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('renders CheckInPage at /check-in', () => {
    renderAppRoute('/check-in');
    expect(screen.getByRole('heading', { name: /Online Check-in/i })).toBeInTheDocument();
  });

  it('renders FlightStatusPage at /status', () => {
    renderAppRoute('/status');
    expect(screen.getByRole('heading', { name: /Flight Status/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated user from /bookings to /login', () => {
    renderAppRoute('/bookings');
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated user from /admin to /login', () => {
    renderAppRoute('/admin');
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
  });

  it('redirects non-admin authenticated user from /admin to home', () => {
    localStorage.setItem(
      'skywing_auth_user',
      JSON.stringify({
        id: 'user-1',
        email: 'customer@skywing.vn',
        name: 'Regular Customer',
        phone: '0912345678',
        role: 'customer',
      })
    );

    renderAppRoute('/admin');
    expect(screen.getByRole('heading', { name: /Search and Book Flights Across Classes/i })).toBeInTheDocument();
  });

  it('allows admin user to access /admin', () => {
    localStorage.setItem(
      'skywing_auth_user',
      JSON.stringify({
        id: 'user-admin',
        email: 'admin@skywing.vn',
        name: 'Admin User',
        phone: '0999999999',
        role: 'admin',
      })
    );

    renderAppRoute('/admin');
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders NotFoundPage on unknown route', () => {
    renderAppRoute('/this-route-does-not-exist');
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('renders exactly one footer when App is mounted at /', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    const footers = screen.getAllByRole('contentinfo');
    expect(footers).toHaveLength(1);
  });
});
