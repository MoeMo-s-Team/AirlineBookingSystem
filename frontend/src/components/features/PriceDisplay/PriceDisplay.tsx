export interface PriceDisplayProps {
  price: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'font-label-lg',
  md: 'font-headline-sm',
  lg: 'font-headline-md',
};

export function PriceDisplay({ 
  price, 
  currency = 'VND', 
  size = 'md', 
  className = '' 
}: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <span className={`text-primary font-bold ${sizeClasses[size]} ${className}`.trim()}>
      {formatted}
    </span>
  );
}
