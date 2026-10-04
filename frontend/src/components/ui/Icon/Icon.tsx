export type IconName =
  | 'add'
  | 'airline_seat_legroom_extra'
  | 'airline_seat_recline_normal'
  | 'airlines'
  | 'airplane_ticket'
  | 'arrow_back'
  | 'arrow_downward'
  | 'arrow_forward'
  | 'bedtime'
  | 'calendar_today'
  | 'cancel'
  | 'check'
  | 'check_circle'
  | 'chevron_left'
  | 'chevron_right'
  | 'close'
  | 'content_copy'
  | 'credit_card'
  | 'dashboard'
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
  | 'info'
  | 'light_mode'
  | 'lock'
  | 'luggage'
  | 'miscellaneous_services'
  | 'more_vert'
  | 'notifications'
  | 'person'
  | 'phone'
  | 'print'
  | 'receipt'
  | 'restaurant'
  | 'schedule'
  | 'search'
  | 'sell'
  | 'settings'
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
