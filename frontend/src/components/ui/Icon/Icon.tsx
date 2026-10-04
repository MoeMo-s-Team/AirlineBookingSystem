export type IconName =
  | 'add'
  | 'airline_seat_legroom_extra'
  | 'airline_seat_recline_normal'
  | 'airlines'
  | 'arrow_back'
  | 'arrow_downward'
  | 'arrow_forward'
  | 'bedtime'
  | 'calendar_today'
  | 'check'
  | 'chevron_left'
  | 'chevron_right'
  | 'close'
  | 'content_copy'
  | 'credit_card'
  | 'dinner_dining'
  | 'edit'
  | 'email'
  | 'error'
  | 'expand_more'
  | 'filter_list'
  | 'flight'
  | 'flight_land'
  | 'flight_takeoff'
  | 'group'
  | 'health_and_safety'
  | 'home'
  | 'light_mode'
  | 'lock'
  | 'luggage'
  | 'notifications'
  | 'person'
  | 'phone'
  | 'receipt'
  | 'restaurant'
  | 'schedule'
  | 'search'
  | 'speed'
  | 'swap_horiz'
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
