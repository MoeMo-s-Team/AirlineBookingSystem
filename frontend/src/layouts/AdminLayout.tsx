import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Icon, type IconName } from '@/components/ui/Icon/Icon';
import { Button } from '@/components/ui/Button/Button';
import { useAuth } from '@/context/AuthContext';

export interface AdminLayoutProps {
  children?: ReactNode;
}

interface AdminNavItem {
  id: string;
  label: string;
  icon: IconName;
  path: string;
}

const adminNavItems: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin' },
  { id: 'flights', label: 'Flights', icon: 'flight', path: '/admin/flights' },
  { id: 'services', label: 'Services', icon: 'miscellaneous_services', path: '/admin/services' },
  { id: 'fares', label: 'Fares', icon: 'sell', path: '/admin/fares' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-outline-variant">
          <Link to="/" className="flex items-center gap-2">
            <img
              alt="SkyWing Logo"
              className="h-8 w-auto"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WKXmyLxsjYeUagEpINwoQY5yURNIbgoeTktKUVR0C6q5Om0a0Wz77anAgM8RFUdnLmZI-oU2n0nPaj1YOT-9uh4TEApLyrhX9Oon8nB8c60CwONqGLaFQkezF8stU4h-mKlTo8jXBW--1cYxKiQOlUzNWSG8pf7phg0ZDOks-t2EaXpqcPKTGa3LOp-n-Jm7voubEn0Q2k3ghQDOUQ9chb5AtwEenP5j1IoUpFnWvf4-Uk8zFgFoIdEA"
            />
            <span className="font-headline-sm text-primary">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-label-lg transition-colors
                  ${isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }
                `}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="font-label-lg text-on-primary-container">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-lg text-on-surface truncate">{user?.name || 'Administrator'}</p>
              <p className="font-body-sm text-on-surface-variant truncate">{user?.email || 'admin@skywing.vn'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant px-6 flex items-center justify-between">
          <h1 className="font-headline-sm text-headline-sm text-primary">
            SkyWing Admin Panel
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
