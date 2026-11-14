import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminFareClassesPage } from './AdminFareClassesPage';
import { fareApi } from '../../api/fareApi';

vi.mock('../../api/fareApi', () => ({ fareApi: { getAllFares: vi.fn(), deleteFare: vi.fn(), createFare: vi.fn(), updateFare: vi.fn() } }));
vi.mock('../../components/layout/AdminSidebar', () => ({ AdminSidebar: () => null }));
vi.mock('../../components/layout/AdminHeader', () => ({ AdminHeader: () => null }));

describe('AdminFareClassesPage deletion', () => {
  it('closes the confirmation and shows the error when a fare has bookings', async () => {
    vi.mocked(fareApi.getAllFares).mockResolvedValue([
      { id: 1, code: 'ECO', name: 'Economy', priceMultiplier: 1, active: true },
    ]);
    const message = "This fare class is used by existing bookings and cannot be deleted.";
    vi.mocked(fareApi.deleteFare).mockRejectedValue({ status: 400, message });
    render(<MemoryRouter><AdminFareClassesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /Delete$/ }));
    fireEvent.click(screen.getByRole('button', { name: "Delete permanently" }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: "Delete permanently" })).not.toBeInTheDocument();
    expect(screen.getByText('Economy')).toBeInTheDocument();
  });

  it('suggests benefits by multiplier, fills only on click, and saves manual edits', async () => {
    vi.mocked(fareApi.getAllFares).mockResolvedValue([]);
    vi.mocked(fareApi.createFare).mockResolvedValue({ id: 2, code: 'CUSTOM', name: 'Custom fare', priceMultiplier: 4, active: true });
    render(<MemoryRouter><AdminFareClassesPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Add fare class/ }));
    fireEvent.change(screen.getByLabelText("Fare class code"), { target: { value: 'custom' } });
    fireEvent.change(screen.getByLabelText("Fare class name"), { target: { value: 'Custom fare' } });
    fireEvent.change(screen.getByLabelText("Price multiplier"), { target: { value: '4' } });
    expect(screen.getByLabelText("Baggage")).toHaveValue('');
    expect(screen.getByLabelText("Baggage")).toHaveAttribute('placeholder', '2x 15kg cabin, 50kg VIP (x4)');
    fireEvent.click(screen.getByRole('button', { name: "⚡ Autofill from multiplier" }));
    expect(screen.getByLabelText("Baggage")).toHaveValue('2x 15kg cabin, 50kg VIP');
    expect(screen.getByLabelText("Seat pitch / type")).toHaveValue('Private suite with sliding door & 180° flat bed');
    expect(screen.getByLabelText("Meal")).toHaveValue('Fine dining à la carte & vintage champagne');
    fireEvent.change(screen.getByLabelText("Baggage"), { target: { value: '45kg' } });
    fireEvent.click(screen.getByRole('button', { name: "Create fare class" }));
    await waitFor(() => expect(fareApi.createFare).toHaveBeenCalledWith({
      code: 'CUSTOM', name: 'Custom fare', priceMultiplier: 4, active: true,
      baggage: '45kg', seatPitch: 'Private suite with sliding door & 180° flat bed',
      meal: 'Fine dining à la carte & vintage champagne',
    }));
  });

  it('keeps saved custom benefits when opening and saving without changing the multiplier', async () => {
    vi.mocked(fareApi.getAllFares).mockResolvedValue([
      { id: 3, code: 'CUSTOM', name: 'Existing', priceMultiplier: 1.5, active: true, baggage: '35kg', seatPitch: '38 inch', meal: 'Custom meal' },
    ]);
    render(<MemoryRouter><AdminFareClassesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /Edit$/ }));
    expect(screen.getByLabelText("Baggage")).toHaveValue('35kg');
    expect(screen.getByLabelText("Baggage")).toHaveAttribute('placeholder', '10kg cabin baggage, 30kg checked (x1.5)');
    fireEvent.click(screen.getByRole('button', { name: "Save changes" }));
    await waitFor(() => expect(fareApi.updateFare).toHaveBeenCalledWith(3, {
      code: 'CUSTOM', name: 'Existing', priceMultiplier: 1.5, active: true,
      baggage: '35kg', seatPitch: '38 inch', meal: 'Custom meal',
    }));
  });

  it('returns filled benefits to live faint hints on every multiplier change', async () => {
    vi.mocked(fareApi.getAllFares).mockResolvedValue([]);
    render(<MemoryRouter><AdminFareClassesPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Add fare class/ }));
    // Suggestions depend on the multiplier even if the code names a different tier.
    fireEvent.change(screen.getByLabelText("Fare class code"), { target: { value: 'ECONOMY' } });
    fireEvent.change(screen.getByLabelText("Price multiplier"), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: "⚡ Autofill from multiplier" }));
    fireEvent.change(screen.getByLabelText("Baggage"), { target: { value: 'Custom baggage' } });
    fireEvent.change(screen.getByLabelText("Price multiplier"), { target: { value: '1.5' } });
    expect(screen.getByLabelText("Baggage")).toHaveValue('');
    expect(screen.getByLabelText("Seat pitch / type")).toHaveValue('');
    expect(screen.getByLabelText("Meal")).toHaveValue('');
    expect(screen.getByLabelText("Baggage")).toHaveAttribute('placeholder', '10kg cabin baggage, 30kg checked (x1.5)');
    fireEvent.click(screen.getByRole('button', { name: "⚡ Autofill from multiplier" }));
    expect(screen.getByLabelText("Baggage")).toHaveValue('10kg cabin baggage, 30kg checked');
    fireEvent.change(screen.getByLabelText("Price multiplier"), { target: { value: '2' } });
    expect(screen.getByLabelText("Baggage")).toHaveValue('');
    expect(screen.getByLabelText("Baggage")).toHaveAttribute('placeholder', '2x 10kg cabin, 40kg priority baggage (x2)');
    expect(screen.getByLabelText("Seat pitch / type")).toHaveAttribute('placeholder', 'Full flat-bed seat with direct aisle access (x2)');
    expect(screen.getByLabelText("Meal")).toHaveAttribute('placeholder', 'Chef-curated gourmet dining & fine wines (x2)');
    fireEvent.change(screen.getByLabelText("Price multiplier"), { target: { value: '0' } });
    expect(screen.getByRole('button', { name: "⚡ Autofill from multiplier" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Price multiplier"), { target: { value: '' } });
    expect(screen.getByLabelText("Price multiplier")).toHaveValue(null);
    expect(screen.getByLabelText("Baggage")).toHaveAttribute('placeholder', "Enter a valid multiplier to see suggestions");
  });
});
