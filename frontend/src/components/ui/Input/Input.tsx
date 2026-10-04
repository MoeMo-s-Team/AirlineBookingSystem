import type { ChangeEvent } from 'react';
import { Icon, type IconName } from '../Icon/Icon';

export interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'search' | 'number' | 'tel';
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'py-2 text-body-sm pl-10 pr-4',
  md: 'py-3 text-body-md pl-11 pr-4',
  lg: 'py-4 text-body-lg pl-12 pr-4',
};

const iconSizeClasses = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function Input({
  label,
  placeholder,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  disabled = false,
  required = false,
  type = 'text',
  value,
  onChange,
  id,
  name,
  className = '',
}: InputProps) {
  const inputId = id || name || `input-${Math.random().toString(36).slice(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name={leftIcon} size={iconSizeClasses[size]} className="text-outline" />
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          aria-invalid={hasError ? 'true' : undefined}
          className={`
            w-full rounded-lg font-body-md
            bg-surface-container-low border 
            text-on-surface placeholder:text-on-surface-variant
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasError 
              ? 'border-error focus:border-error' 
              : 'border-outline-variant focus:border-secondary'
            }
            ${sizeClasses[size]}
            ${leftIcon ? 'pl-11' : ''}
            ${rightIcon ? 'pr-11' : ''}
          `}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name={rightIcon} size={iconSizeClasses[size]} className="text-on-surface-variant" />
          </span>
        )}
      </div>
      {(error || helperText) && (
        <span className={`font-body-sm ${hasError ? 'text-error' : 'text-on-surface-variant'}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
}
