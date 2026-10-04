import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Icon, type IconName } from '@/components/ui/Icon/Icon';

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: IconName;
  category: 'baggage' | 'meal' | 'seat' | 'priority' | 'insurance';
}

export interface ServiceCardProps {
  service: ServiceData;
  selected: boolean;
  onToggle: () => void;
  className?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export function ServiceCard({ service, selected, onToggle, className = '' }: ServiceCardProps) {
  return (
    <Card
      variant={selected ? 'elevated' : 'outlined'}
      hoverable
      padding="md"
      onClick={onToggle}
      className={`
        cursor-pointer transition-all relative overflow-hidden
        ${selected 
          ? 'ring-2 ring-secondary shadow-elevated' 
          : 'hover:shadow-card'
        } ${className}
      `.trim()}
    >
      {/* Selected overlay */}
      {selected && (
        <div className="absolute inset-0 bg-surface-container-low pointer-events-none opacity-50" />
      )}

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Icon name={service.icon} size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-headline-sm text-primary">{service.name}</h3>
                <span className="font-label-sm text-secondary font-medium">
                  {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                </span>
              </div>
            </div>
            <Badge variant={selected ? 'secondary' : 'neutral'}>
              +{formatPrice(service.price)}
            </Badge>
          </div>

          {/* Description */}
          <p className="font-body-sm text-on-surface-variant mt-space-sm leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Selected indicator */}
        {selected && (
          <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
            <span className="flex items-center gap-2 text-secondary font-label-md font-semibold">
              <Icon name="check" size={18} />
              Added to booking
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
