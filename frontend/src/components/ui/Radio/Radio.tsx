import type { ReactNode } from 'react';

export interface RadioProps {
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  label?: ReactNode;
  value: string;
  name: string;
  id?: string;
  className?: string;
}

export function Radio({
  checked = false,
  onChange,
  disabled = false,
  label,
  value,
  name,
  id,
  className = '',
}: RadioProps) {
  const radioId = id || `${name}-${value}`;

  const handleChange = () => {
    onChange?.(value);
  };

  return (
    <label 
      htmlFor={radioId}
      className={`
        inline-flex items-center gap-2 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative">
        <input
          type="radio"
          id={radioId}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="
            w-4 h-4 rounded-full
            border-2 border-outline
            bg-transparent
            appearance-none
            cursor-pointer
            transition-colors duration-150
            checked:border-secondary
            focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:ring-offset-2
            disabled:cursor-not-allowed
          "
        />
        {checked && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-secondary" />
          </span>
        )}
      </div>
      {label && (
        <span className="font-body-md text-on-surface">{label}</span>
      )}
    </label>
  );
}
