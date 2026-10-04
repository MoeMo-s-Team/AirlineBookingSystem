import { Card } from '@/components/ui/Card/Card';
import { Icon } from '@/components/ui/Icon/Icon';

export interface SummaryItem {
  label: string;
  value: number;
  type?: 'base' | 'addon' | 'tax' | 'total';
}

export interface BookingSummaryProps {
  items: SummaryItem[];
  grandTotal: number;
  currency?: string;
  className?: string;
}

const formatPrice = (price: number, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
};

export function BookingSummary({
  items,
  grandTotal,
  currency = 'VND',
  className = '',
}: BookingSummaryProps) {
  return (
    <Card variant="elevated" padding="md" className={className}>
      <h3 className="font-headline-sm text-primary mb-4">Price Summary</h3>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.type === 'addon' && (
                <Icon name="add" size={16} className="text-secondary" />
              )}
              {item.type === 'tax' && (
                <Icon name="receipt" size={16} className="text-outline" />
              )}
              <span className={`
                font-body-md
                ${item.type === 'addon' ? 'text-secondary' : 'text-on-surface'}
              `}>
                {item.label}
              </span>
            </div>
            <span className={`
              font-label-lg
              ${item.type === 'addon' ? 'text-secondary' : 'text-on-surface'}
            `}>
              {item.type === 'addon' ? '+' : ''}{formatPrice(item.value, currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-outline-variant my-4" />

      {/* Grand Total */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-label-lg text-on-surface">Grand Total</span>
          <span className="font-body-sm text-on-surface-variant block">
            (incl. taxes)
          </span>
        </div>
        <div className="text-right">
          <span className="font-headline-md text-primary font-bold">
            {formatPrice(grandTotal, currency)}
          </span>
        </div>
      </div>
    </Card>
  );
}
