import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon/Icon';
import { Avatar } from '@/components/ui/Avatar/Avatar';

export interface HeaderUser {
  name: string;
  avatar?: string;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface HeaderProps {
  user?: HeaderUser;
  activeNav?: string;
  onNotificationClick?: () => void;
}

const navItems = [
  { id: 'book-flight', label: 'Book Flight', path: '/' },
  { id: 'manage-booking', label: 'Manage Booking', path: '/bookings' },
  { id: 'check-in', label: 'Check-in', path: '/check-in' },
  { id: 'flight-status', label: 'Flight Status', path: '/status' },
];

export function Header({ user, activeNav, onNotificationClick }: HeaderProps) {
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant shadow-[0_1px_3px_rgba(13,71,161,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-space-sm">
          <img 
            alt="SkyWing Airlines Logo" 
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1WKXmyLxsjYeUagEpINwoQY5yURNIbgoeTktKUVR0C6q5Om0a0Wz77anAgM8RFUdnLmZI-oU2n0nPaj1YOT-9uh4TEApLyrhX9Oon8nB8c60CwONqGLaFQkezF8stU4h-mKlTo8jXBW--1cYxKiQOlUzNWSG8pf7phg0ZDOks-t2EaXpqcPKTGa3LOp-n-Jm7voubEn0Q2k3ghQDOUQ9chb5AtwEenP5j1IoUpFnWvf4-Uk8zFgFoIdEA"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-space-xs ml-space-md">
          {navItems.map((item) => {
            const isActive = activeNav === item.id || location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  px-space-md py-space-sm rounded-lg font-label-md transition-colors
                  ${isActive 
                    ? 'bg-surface-container text-primary font-label-lg' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-space-md">
          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            aria-label="Notifications"
            className="relative p-space-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <Icon name="notifications" size={22} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest" />
          </button>

          {/* Sign In / User Menu */}
          {user ? (
            <div className="flex items-center gap-space-sm">
              <Avatar 
                src={user.avatar} 
                initials={getInitials(user.name)} 
                size="sm" 
              />
            </div>
          ) : (
            <Link 
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs border border-secondary-container text-secondary font-label-lg rounded-lg hover:bg-surface-container hover:text-on-secondary-container transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
