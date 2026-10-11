import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SearchFlightPage } from './pages/SearchFlightPage';
import { FlightResultsPage } from './pages/FlightResultsPage';
import { PassengerInfoPage } from './pages/PassengerInfoPage';
import { AdditionalServicesPage } from './pages/AdditionalServicesPage';
import { CheckoutPaymentPage } from './pages/CheckoutPaymentPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { AdminFlightsPage } from './pages/admin/AdminFlightsPage';
import { AdminFareClassesPage } from './pages/admin/AdminFareClassesPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminRoute } from './components/auth/AdminRoute';
import { AuthenticatedRoute } from './components/auth/AuthenticatedRoute';
import { CustomerRoute } from './components/auth/CustomerRoute';
import { AuthProvider } from './context/AuthContext';
import { BookingFlowProvider } from './hooks/useBookingFlow';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookingFlowProvider>
      <ScrollToTop />
      <Routes>
        {/* Passenger Experience Routes (Guarded: Admins are redirected to /admin/flights) */}
        <Route
          path="/"
          element={
            <CustomerRoute>
              <SearchFlightPage />
            </CustomerRoute>
          }
        />
        <Route
          path="/flights"
          element={
            <CustomerRoute>
              <FlightResultsPage />
            </CustomerRoute>
          }
        />
        <Route
          path="/passenger"
          element={
            <CustomerRoute>
              <AuthenticatedRoute><PassengerInfoPage /></AuthenticatedRoute>
            </CustomerRoute>
          }
        />
        <Route
          path="/services"
          element={
            <CustomerRoute>
              <AuthenticatedRoute><AdditionalServicesPage /></AuthenticatedRoute>
            </CustomerRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <CustomerRoute>
              <AuthenticatedRoute><CheckoutPaymentPage /></AuthenticatedRoute>
            </CustomerRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <CustomerRoute>
              <AuthenticatedRoute><BookingConfirmationPage /></AuthenticatedRoute>
            </CustomerRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <CustomerRoute>
              <AuthenticatedRoute><MyBookingsPage /></AuthenticatedRoute>
            </CustomerRoute>
          }
        />
        <Route
          path="/sign-in"
          element={
            <CustomerRoute>
              <SignInPage />
            </CustomerRoute>
          }
        />
        <Route
          path="/sign-up"
          element={
            <CustomerRoute>
              <SignUpPage />
            </CustomerRoute>
          }
        />

        {/* Unified Login Routes */}
        <Route path="/login" element={<Navigate to="/sign-in" replace />} />
        <Route path="/admin/login" element={<Navigate to="/sign-in" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/flights" replace />} />
        <Route
          path="/admin/flights"
          element={
            <AdminRoute>
              <AdminFlightsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/fare-classes"
          element={
            <AdminRoute>
              <AdminFareClassesPage />
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
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookingsPage />
            </AdminRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BookingFlowProvider>
    </AuthProvider>
  );
};

export default App;
