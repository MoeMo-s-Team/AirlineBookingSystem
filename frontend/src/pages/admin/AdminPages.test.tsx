import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminFlightsPage } from './AdminFlightsPage';
import { AdminServicesPage } from './AdminServicesPage';
import { AdminFaresPage } from './AdminFaresPage';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Admin Pages', () => {
  it('renders AdminDashboardPage with stats and recent bookings', () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Total Flights')).toBeInTheDocument();
    expect(screen.getByText('Active Bookings')).toBeInTheDocument();
    expect(screen.getByText('Recent Bookings')).toBeInTheDocument();
  });

  it('renders AdminFlightsPage with flights table', () => {
    renderWithProviders(<AdminFlightsPage />);

    expect(screen.getByRole('heading', { name: 'Flights' })).toBeInTheDocument();
    expect(screen.getByText('VN1234')).toBeInTheDocument();
    expect(screen.getAllByText('HAN → SGN').length).toBeGreaterThan(0);
  });

  it('renders AdminServicesPage and opens create modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminServicesPage />);

    expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument();
    expect(screen.getByText('Extra Baggage (20kg)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Add Service/i }));
    expect(screen.getByRole('heading', { name: 'Add Service' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Extra Baggage (20kg)')).toBeInTheDocument();
  });

  it('renders AdminFaresPage and opens create modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminFaresPage />);

    expect(screen.getByRole('heading', { name: 'Fare Classes' })).toBeInTheDocument();
    expect(screen.getByText('Economy Class')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Add Fare/i }));
    expect(screen.getByRole('heading', { name: 'Add Fare Class' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., ECO')).toBeInTheDocument();
  });
});
