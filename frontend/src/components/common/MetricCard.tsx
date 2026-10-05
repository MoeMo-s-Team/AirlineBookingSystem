import React from 'react';

export interface MetricCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly changeText?: string;
  readonly icon: string;
  readonly trend?: 'positive' | 'negative' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  changeText,
  icon,
  trend = 'positive'
}) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-label-md text-on-surface-variant font-medium uppercase tracking-wider">
          {title}
        </span>
        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      <div className="text-headline-md font-bold text-primary tracking-tight">
        {value}
      </div>
      {changeText && (
        <div className="flex items-center gap-1 mt-2 text-label-sm">
          <span
            className={`font-semibold ${
              trend === 'positive'
                ? 'text-secondary'
                : trend === 'negative'
                ? 'text-error'
                : 'text-outline'
            }`}
          >
            {changeText}
          </span>
        </div>
      )}
    </div>
  );
};
