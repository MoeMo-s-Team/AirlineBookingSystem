export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 14,
  md: 20,
  lg: 32,
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span 
      className={`material-symbols-outlined animate-spin ${className}`}
      style={{ fontSize: sizeMap[size] }}
    >
      progress_activity
    </span>
  );
}
