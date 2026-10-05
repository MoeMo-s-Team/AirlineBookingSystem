import React from 'react';

export interface StatusBadgeProps {
  readonly status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'DELAYED' | 'CANCELLED' | 'CONFIRMED' | 'PENDING' | 'COMPLETED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'bg-surface-container text-primary border-outline-variant';
      case 'BOARDING':
        return 'bg-secondary-fixed text-on-secondary-container border-secondary-container animate-pulse';
      case 'DEPARTED':
      case 'COMPLETED':
        return 'bg-surface-container-high text-on-surface-variant border-outline-variant';
      case 'DELAYED':
        return 'bg-error-container text-on-error-container border-error/20';
      case 'CANCELLED':
        return 'bg-error text-on-error border-error';
      case 'PENDING':
        return 'bg-tertiary-fixed text-on-tertiary-container border-tertiary-container';
      default:
        return 'bg-surface-container text-on-surface border-outline-variant';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'SCHEDULED':
        return 'schedule';
      case 'BOARDING':
        return 'airline_stops';
      case 'DEPARTED':
      case 'COMPLETED':
        return 'check_circle';
      case 'DELAYED':
        return 'error_outline';
      case 'CANCELLED':
        return 'cancel';
      case 'CONFIRMED':
        return 'task_alt';
      case 'PENDING':
        return 'hourglass_empty';
      default:
        return 'info';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${getBadgeStyle()}`}>
      <span className="material-symbols-outlined text-[14px]">{getStatusIcon()}</span>
      <span>{status}</span>
    </span>
  );
};
