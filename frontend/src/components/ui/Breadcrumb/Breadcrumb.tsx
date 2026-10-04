import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../Icon/Icon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: IconName;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-space-xs text-on-surface-variant font-label-md ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <Fragment key={index}>
            {index > 0 && (
              <span className="text-outline-variant">/</span>
            )}
            {isLast || !item.href ? (
              <span className={isLast ? 'text-primary font-bold' : ''}>
                {item.icon && !isFirst && <Icon name={item.icon} size={16} className="inline mr-1" />}
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.href} 
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                <span>{item.label}</span>
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
