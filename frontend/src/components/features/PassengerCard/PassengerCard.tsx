import { Card } from '@/components/ui/Card/Card';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon } from '@/components/ui/Icon/Icon';

export interface PassengerData {
  id: string;
  name: string;
  avatar?: string;
  type: 'adult' | 'child' | 'infant';
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  email?: string;
  phone?: string;
}

export interface PassengerCardProps {
  passenger: PassengerData;
  isPrimary?: boolean;
  className?: string;
}

export function PassengerCard({ 
  passenger, 
  isPrimary = false,
  className = '' 
}: PassengerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card variant="elevated" padding="md" className={className}>
      <div className="flex items-start gap-4">
        <Avatar
          src={passenger.avatar}
          initials={getInitials(passenger.name)}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-lg text-primary font-semibold">
              {passenger.name}
            </span>
            {isPrimary && (
              <Badge variant="secondary" size="sm">
                Primary Contact
              </Badge>
            )}
            <Badge variant="neutral" size="sm">
              {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)}
            </Badge>
            {passenger.tier && (
              <Badge variant="primary" size="sm">
                {passenger.tier}
              </Badge>
            )}
          </div>

          {(passenger.email || passenger.phone) && (
            <div className="mt-2 space-y-1">
              {passenger.email && (
                <span className="flex items-center gap-2 font-body-sm text-on-surface-variant">
                  <Icon name="email" size={14} className="text-secondary" />
                  {passenger.email}
                </span>
              )}
              {passenger.phone && (
                <span className="flex items-center gap-2 font-body-sm text-on-surface-variant">
                  <Icon name="phone" size={14} className="text-secondary" />
                  {passenger.phone}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
