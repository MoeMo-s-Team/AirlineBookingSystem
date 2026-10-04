import type { ChangeEvent } from 'react';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value = min,
  onChange,
  disabled = false,
  label,
  formatValue = (v) => v.toString(),
  className = '',
}: SliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(Number(e.target.value));
  };

  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="font-label-lg text-label-lg text-primary">{label}</span>
          <span className="font-label-md text-label-md font-bold text-secondary">
            {formatValue(value)}
          </span>
        </div>
      )}
      <div className="relative pt-2 px-1">
        <div 
          className="absolute top-1/2 left-0 h-1.5 bg-secondary-container rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="
            w-full h-1.5 appearance-none bg-surface-container-high rounded-full
            cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-secondary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-secondary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
          "
        />
      </div>
      <div className="flex justify-between text-[11px] font-label-sm text-outline px-1">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
