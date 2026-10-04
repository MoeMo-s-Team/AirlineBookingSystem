import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { DashboardPage } from './DashboardPage';
import { FlightResultsPage } from './FlightResultsPage';
import { PassengerInfoPage } from './PassengerInfoPage';
import { ServicesPage } from './ServicesPage';
import { PaymentPage } from './PaymentPage';
import { ConfirmationPage } from './ConfirmationPage';

function renderWithProviders(ui: React.ReactElement, initialRoute = '/') {
  return render(
    <AuthProvider>
      <BookingProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          {ui}
        </MemoryRouter>
      </BookingProvider>
    </AuthProvider>
  );
}

describe('User Booking Pages', () => {
  it('renders DashboardPage with hero and search console', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /Search and Book Flights Across Classes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Flights/i })).toBeInTheDocument();
  });

  it('renders FlightResultsPage with flights and filters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FlightResultsPage />);

    expect(screen.getByRole('heading', { name: /Select Your Flight/i })).toBeInTheDocument();
    expect(screen.getByText('All Prices')).toBeInTheDocument();
    expect(screen.getByText('Under 3.5M')).toBeInTheDocument();

    // Click filter
    await user.click(screen.getByText('Under 3.5M'));
    // Should filter flights
    expect(screen.getAllByText(/SkyWing Airlines|VietJet Air/i).length).toBeGreaterThan(0);
  });

  it('renders PassengerInfoPage and validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PassengerInfoPage />);

    expect(screen.getByRole('heading', { name: /Passenger Information/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('NGUYEN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('VAN A')).toBeInTheDocument();

    // Click continue without entering data
    await user.click(screen.getByRole('button', { name: /Continue to Services/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please fill in First Name, Last Name, and Email');
  });

  it('renders ServicesPage with add-on options', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ServicesPage />);

    expect(screen.getByRole('heading', { name: /Customize Your Trip/i })).toBeInTheDocument();
    expect(screen.getByText('Extra Baggage (20kg)')).toBeInTheDocument();

    // Toggle service
    await user.click(screen.getByText('Extra Baggage (20kg)'));
    expect(screen.getByRole('button', { name: /Continue to Payment/i })).toBeInTheDocument();
  });

  it('renders PaymentPage with card form and SSL badge', () => {
    renderWithProviders(<PaymentPage />);

    expect(screen.getByRole('heading', { name: /Payment Details/i })).toBeInTheDocument();
    expect(screen.getByText(/256-bit SSL Encrypted Payment/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('NGUYEN VAN A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM/YY')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123')).toBeInTheDocument();
  });

  it('renders ConfirmationPage with ticket and action buttons', () => {
    renderWithProviders(<ConfirmationPage />);

    expect(screen.getByText(/Thank You, Your Flight is Booked!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print Ticket/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View My Bookings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Book Another Flight/i })).toBeInTheDocument();
  });
});
