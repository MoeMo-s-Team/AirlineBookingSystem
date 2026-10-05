import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProgressStepper } from './ProgressStepper';

const mockSteps = [
  { id: '1', label: 'Select Flight', href: '/flights' },
  { id: '2', label: 'Passenger Info', href: '/passenger' },
  { id: '3', label: 'Add-ons' },
  { id: '4', label: 'Payment' },
];

describe('ProgressStepper', () => {
  it('renders all steps', () => {
    render(
      <BrowserRouter>
        <ProgressStepper steps={mockSteps} currentStep={0} />
      </BrowserRouter>
    );
    expect(screen.getByText('Select Flight')).toBeInTheDocument();
    expect(screen.getByText('Passenger Info')).toBeInTheDocument();
    expect(screen.getByText('Add-ons')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
  });

  it('shows check icon for completed steps', () => {
    render(
      <BrowserRouter>
        <ProgressStepper steps={mockSteps} currentStep={2} />
      </BrowserRouter>
    );
    const checkIcons = document.querySelectorAll('.material-symbols-outlined');
    expect(checkIcons.length).toBeGreaterThanOrEqual(2);
  });

  it('highlights current step', () => {
    render(
      <BrowserRouter>
        <ProgressStepper steps={mockSteps} currentStep={2} />
      </BrowserRouter>
    );
    const activeContainer = screen.getByText('Add-ons').closest('div');
    expect(activeContainer?.className).toContain('bg-surface-container-high');
  });
});
