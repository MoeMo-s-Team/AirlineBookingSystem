import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses = {
  primary: 'bg-secondary text-on-secondary hover:bg-secondary-container active:bg-primary-container',
  secondary: 'bg-transparent border border-primary text-primary hover:bg-surface-container-low',
  tertiary: 'text-on-surface-variant hover:text-on-surface',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-label-md',
  md: 'px-6 py-3 text-label-lg',
  lg: 'px-8 py-4 text-label-lg',
};

const loadingSizeClasses = {
  sm: 14,
  md: 18,
  lg: 20,
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded font-label-lg
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading && (
        <span 
          className="material-symbols-outlined animate-spin" 
          style={{ fontSize: loadingSizeClasses[size] }}
        >
          progress_activity
        </span>
      )}
      {!loading && leftIcon && <Icon name={leftIcon} size={16} />}
      {children}
      {!loading && rightIcon && <Icon name={rightIcon} size={16} />}
    </button>
  );
}
