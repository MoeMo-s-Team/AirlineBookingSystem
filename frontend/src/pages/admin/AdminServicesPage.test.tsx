import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminServicesPage } from './AdminServicesPage';
import { serviceApi } from '../../api/serviceApi';

vi.mock('../../api/serviceApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/serviceApi')>();
  return { serviceApi: { ...actual.serviceApi, getAllServices: vi.fn(), deleteService: vi.fn() } };
});
vi.mock('../../components/layout/AdminSidebar', () => ({ AdminSidebar: () => null }));
vi.mock('../../components/layout/AdminHeader', () => ({ AdminHeader: () => null }));

describe('AdminServicesPage deletion', () => {
  it('returns to the catalog and shows the reason when deletion is refused', async () => {
    vi.mocked(serviceApi.getAllServices).mockResolvedValue([
      { id: 10, name: 'Extra baggage', type: 'BAGGAGE', price: 250000, active: true },
    ]);
    const message = "A service used by existing bookings cannot be deleted.";
    vi.mocked(serviceApi.deleteService).mockRejectedValue({ status: 400, message });
    render(<MemoryRouter><AdminServicesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /Delete$/ }));
    fireEvent.click(screen.getByRole('button', { name: "Delete permanently" }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: "Delete permanently" })).not.toBeInTheDocument();
    expect(screen.getByText('Extra baggage')).toBeInTheDocument();
  });
});
