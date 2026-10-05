import type { ReactNode, ChangeEvent } from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  id?: string;
  name?: string;
  className?: string;
}

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  label,
  id,
  name,
  className = '',
}: CheckboxProps) {
  const checkboxId = id || name || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label 
      htmlFor={checkboxId}
      className={`
        inline-flex items-center gap-2 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="
            w-4 h-4 rounded
            border-2 border-outline
            bg-transparent
            appearance-none
            cursor-pointer
            transition-colors duration-150
            checked:bg-secondary checked:border-secondary
            focus:outline-none focus:ring-2 focus:ring-secondary-fixed focus:ring-offset-2
            disabled:cursor-not-allowed
          "
        />
        {checked && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="material-symbols-outlined text-on-secondary text-[14px]">
              check
            </span>
          </span>
        )}
      </div>
      {label && (
        <span className="font-body-md text-on-surface">{label}</span>
      )}
    </label>
  );
}
