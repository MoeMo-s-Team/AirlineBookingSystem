import type { ChangeEvent } from 'react';
import { Icon } from '../Icon/Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  required = false,
  id,
  name,
  className = '',
}: SelectProps) {
  const selectId = id || name || `select-${Math.random().toString(36).slice(2, 9)}`;
  const hasError = Boolean(error);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          aria-invalid={hasError ? 'true' : undefined}
          className={`
            w-full pl-11 pr-10 py-3 rounded-lg font-body-md appearance-none
            bg-surface-container-low border
            text-on-surface
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-secondary-fixed
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            ${hasError 
              ? 'border-error focus:border-error' 
              : 'border-outline-variant focus:border-secondary'
            }
          `}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon name="expand_more" size={20} className="text-outline" />
        </span>
      </div>
      {error && (
        <span className="font-body-sm text-error">{error}</span>
      )}
    </div>
  );
}
