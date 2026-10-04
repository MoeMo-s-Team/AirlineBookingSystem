import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-container text-on-secondary-container',
  success: 'bg-[#dcfce7] text-[#166534]',
  warning: 'bg-amber-100 text-amber-900',
  error: 'bg-error-container text-on-error-container',
  neutral: 'bg-surface-container-high text-on-surface-variant',
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-label-sm',
  lg: 'px-3 py-1.5 text-label-md',
};

export function Badge({ 
  variant = 'neutral', 
  size = 'md', 
  children, 
  className = '' 
}: BadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center rounded-full font-label-sm font-semibold
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
