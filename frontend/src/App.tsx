import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Booking Pages
import { DashboardPage } from './pages/booking/DashboardPage';
import { FlightResultsPage } from './pages/booking/FlightResultsPage';
import { PassengerInfoPage } from './pages/booking/PassengerInfoPage';
import { ServicesPage } from './pages/booking/ServicesPage';
import { PaymentPage } from './pages/booking/PaymentPage';
import { ConfirmationPage } from './pages/booking/ConfirmationPage';

// User Pages
import { MyBookingsPage } from './pages/user/MyBookingsPage';
import { BookingDetailsPage } from './pages/user/BookingDetailsPage';
import { CheckInPage } from './pages/user/CheckInPage';
import { FlightStatusPage } from './pages/user/FlightStatusPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminFlightsPage } from './pages/admin/AdminFlightsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminFaresPage } from './pages/admin/AdminFaresPage';

// Protected Route Component
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin Route Component
export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// 404 Component
export function NotFoundPage() {
  return (
    <MainLayout>
      <div className="text-center py-20">
        <h1 className="font-display-hero text-primary mb-4">404</h1>
        <p className="font-body-lg text-on-surface-variant mb-6">Page not found</p>
        <a href="/" className="text-secondary hover:text-primary font-semibold">
          Go back home
        </a>
      </div>
    </MainLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Public User Routes */}
            <Route path="/" element={<DashboardPage />} />
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

            {/* Booking Flow Routes */}
            <Route
              path="/flights"
              element={
                <ProtectedRoute>
                  <FlightResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/passenger"
              element={
                <ProtectedRoute>
                  <PassengerInfoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/confirmation"
              element={
                <ProtectedRoute>
                  <ConfirmationPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/flights"
              element={
                <AdminRoute>
                  <AdminFlightsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <AdminRoute>
                  <AdminServicesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/fares"
              element={
                <AdminRoute>
                  <AdminFaresPage />
                </AdminRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
