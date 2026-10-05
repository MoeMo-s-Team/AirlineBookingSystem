import { Badge, type BadgeProps } from '@/components/ui/Badge/Badge';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'check_in';

export interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusConfig: Record<BookingStatus, { variant: NonNullable<BadgeProps['variant']>; label: string }> = {
  confirmed: { variant: 'success', label: 'CONFIRMED' },
  pending: { variant: 'warning', label: 'PENDING' },
  cancelled: { variant: 'error', label: 'CANCELLED' },
  completed: { variant: 'primary', label: 'COMPLETED' },
  check_in: { variant: 'secondary', label: 'CHECK-IN' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
