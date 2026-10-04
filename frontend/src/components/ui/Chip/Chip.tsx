import type { ReactNode, KeyboardEvent } from 'react';
import { Icon, type IconName } from '../Icon/Icon';

export interface ChipProps {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  leftIcon?: IconName;
  children: ReactNode;
  className?: string;
}

export function Chip({
  selected = false,
  disabled = false,
  onClick,
  leftIcon,
  children,
  className = '',
}: ChipProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={`
        inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-label-md
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${selected
          ? 'bg-primary text-on-primary border-transparent hover:bg-primary-container'
          : 'bg-surface-container-high border border-outline text-on-surface-variant hover:border-primary hover:text-primary'
        }
        ${className}
      `}
    >
      {leftIcon && <Icon name={leftIcon} size={14} />}
      {children}
    </button>
  );
}
