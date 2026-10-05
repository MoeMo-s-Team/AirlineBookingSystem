import type { ReactNode } from 'react';

export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variantClasses = {
  elevated: 'bg-surface-container-lowest shadow-card',
  outlined: 'bg-surface-container-lowest border border-outline-variant',
  flat: 'bg-surface-container-lowest',
};

export function Card({
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  children,
  onClick,
  className = '',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverable || onClick ? 'cursor-pointer transition-all duration-200 hover:shadow-elevated hover:border-secondary' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
