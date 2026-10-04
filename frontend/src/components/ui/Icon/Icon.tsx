export type IconName =
  | 'arrow_back'
  | 'arrow_forward'
  | 'bedtime'
  | 'calendar_today'
  | 'check'
  | 'chevron_left'
  | 'chevron_right'
  | 'close'
  | 'credit_card'
  | 'edit'
  | 'error'
  | 'expand_more'
  | 'filter_list'
  | 'flight_land'
  | 'flight_takeoff'
  | 'home'
  | 'light_mode'
  | 'lock'
  | 'notifications'
  | 'person'
  | 'schedule'
  | 'search'
  | 'timer'
  | 'tune'
  | 'verified'
  | 'warning'
  | 'wb_sunny'
  | 'wb_twilight';

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className = '' }: IconProps) {
  return (
    <span 
      className={`material-symbols-outlined ${className}`} 
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
