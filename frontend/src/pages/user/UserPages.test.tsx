import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MyBookingsPage } from './MyBookingsPage';
import { BookingDetailsPage } from './BookingDetailsPage';
import { CheckInPage } from './CheckInPage';
import { FlightStatusPage } from './FlightStatusPage';

function renderWithRouter(ui: React.ReactElement, initialRoute = '/') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('User Pages (Non-Booking)', () => {
  it('renders MyBookingsPage with list of bookings', () => {
    renderWithRouter(<MyBookingsPage />);

    expect(screen.getByRole('heading', { name: /My Bookings/i })).toBeInTheDocument();
    expect(screen.getAllByText(/VN1234|VN5678|VN160/i).length).toBeGreaterThan(0);
  });

  it('renders BookingDetailsPage for existing booking id', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/bookings/book-1']}>
          <Routes>
            <Route path="/bookings/:id" element={<BookingDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Back to My Bookings')).toBeInTheDocument();
    expect(screen.getByText(/Thank You, Your Flight is Booked!/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Print/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
  });

  it('renders not found for non-existing booking id', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/bookings/invalid-id']}>
          <Routes>
            <Route path="/bookings/:id" element={<BookingDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /Booking not found/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to My Bookings/i })).toBeInTheDocument();
  });

  it('renders CheckInPage and validates inputs', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CheckInPage />);

    expect(screen.getByRole('heading', { name: /Online Check-in/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., BK-ABC123')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('e.g., BK-ABC123'), 'BK-INVALID');
    await user.type(screen.getByPlaceholderText('As shown on ticket'), 'UNKNOWN');
    await user.click(screen.getByRole('button', { name: /Check In/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Booking not found/i);
  });

  it('renders FlightStatusPage and searches flight status', async () => {
    const user = userEvent.setup();
    renderWithRouter(<FlightStatusPage />);

    expect(screen.getByRole('heading', { name: /Flight Status/i })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Enter flight number (e.g., VN1234)'), 'VN1234');
    await user.click(screen.getByRole('button', { name: /Search/i }));

    expect(screen.getByText('On Time')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'VN1234' })).toBeInTheDocument();
  });
});
