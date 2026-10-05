import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';

const mockSteps = [
  { id: '1', label: 'Select Flight', status: 'complete' as const },
  { id: '2', label: 'Passenger Info', status: 'complete' as const },
  { id: '3', label: 'Add-ons', status: 'active' as const },
  { id: '4', label: 'Payment', status: 'pending' as const },
];

describe('Stepper', () => {
  it('renders all steps', () => {
    render(<Stepper steps={mockSteps} />);
    // Each step label appears (sublabel + main label), count varies by status
    // Active step shows "Active" in sublabel, not the label
    expect(screen.getAllByText('Select Flight').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Passenger Info').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Add-ons').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Payment').length).toBeGreaterThanOrEqual(1);
  });

  it('shows check icon for completed steps', () => {
    render(<Stepper steps={mockSteps} />);
    const checkIcons = document.querySelectorAll('.material-symbols-outlined');
    expect(checkIcons.length).toBeGreaterThanOrEqual(2);
  });

  it('shows active state for current step', () => {
    render(<Stepper steps={mockSteps} />);
    const activeStep = screen.getByText('Active');
    expect(activeStep).toBeInTheDocument();
  });
});
