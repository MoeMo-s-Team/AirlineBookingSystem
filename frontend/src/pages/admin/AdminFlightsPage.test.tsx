import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminFlightsPage } from './AdminFlightsPage';
import { flightAdminApi } from '../../api/flightAdminApi';

vi.mock('../../api/flightAdminApi', () => ({
  flightAdminApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin', fullName: 'Admin', role: 'ADMIN' },
    signOut: vi.fn(),
  }),
}));

const flight = {
  id: 12,
  flightNumber: 'SW012',
  origin: 'SGN',
  destination: 'HAN',
  departureTime: '2099-01-01T09:00:00',
  arrivalTime: '2099-01-01T11:00:00',
  basePrice: 1200000,
  availableSeats: 80,
  prices: {},
};

function renderPage() {
  render(<MemoryRouter><AdminFlightsPage /></MemoryRouter>);
}

describe('AdminFlightsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(flightAdminApi.list).mockResolvedValue([flight]);
  });

  it('loads real flights and submits only changed fields for editing', async () => {
    vi.mocked(flightAdminApi.update).mockResolvedValue({ ...flight, basePrice: 1400000 });
    renderPage();
    await screen.findByText('SW012');
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Base price (VND)'), { target: { value: '1400000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(flightAdminApi.update).toHaveBeenCalledWith(12, { basePrice: 1400000 }));
    expect(await screen.findByText('Đã cập nhật chuyến bay.')).toBeInTheDocument();
  });

  it('creates a flight and displays the saved record', async () => {
    const created = { ...flight, id: 13, flightNumber: 'SW013' };
    vi.mocked(flightAdminApi.create).mockResolvedValue(created);
    renderPage();
    await screen.findByText('SW012');
    fireEvent.click(screen.getByRole('button', { name: 'Add flight' }));
    fireEvent.change(screen.getByLabelText('Flight number'), { target: { value: 'sw013' } });
    fireEvent.change(screen.getByLabelText('Origin (IATA)'), { target: { value: 'SGN' } });
    fireEvent.change(screen.getByLabelText('Destination (IATA)'), { target: { value: 'HAN' } });
    fireEvent.change(screen.getByLabelText('Departure'), { target: { value: '2099-01-01T09:00' } });
    fireEvent.change(screen.getByLabelText('Arrival'), { target: { value: '2099-01-01T11:00' } });
    fireEvent.change(screen.getByLabelText('Base price (VND)'), { target: { value: '1200000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create flight' }));
    await waitFor(() => expect(flightAdminApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ flightNumber: 'SW013', origin: 'SGN', destination: 'HAN' })
    ));
    expect(await screen.findByText('SW013')).toBeInTheDocument();
  });

  it('deletes only after confirmation', async () => {
    vi.mocked(flightAdminApi.remove).mockResolvedValue(undefined);
    renderPage();
    await screen.findByText('SW012');
    fireEvent.click(screen.getByRole('button', { name: 'Delete SW012' }));
    expect(flightAdminApi.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete flight' }));
    await waitFor(() => expect(flightAdminApi.remove).toHaveBeenCalledWith(12));
    expect(screen.queryByText('SW012')).not.toBeInTheDocument();
  });

  it('filters the schedule by flight number and departure', async () => {
    const past = { ...flight, id: 14, flightNumber: 'SW014', departureTime: '2020-01-01T09:00:00' };
    vi.mocked(flightAdminApi.list).mockResolvedValue([flight, past]);
    renderPage();
    await screen.findByText('SW014');
    fireEvent.click(screen.getByRole('button', { name: 'Upcoming' }));
    expect(screen.queryByText('SW014')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search flights by number or airport' }), { target: { value: 'SW012' } });
    expect(screen.getByText('SW012')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search flights by number or airport' }), { target: { value: 'PQC' } });
    expect(screen.getByText('No matching flights')).toBeInTheDocument();
  });
});
