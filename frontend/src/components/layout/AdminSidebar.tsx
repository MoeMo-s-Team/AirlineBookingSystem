import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface AdminSidebarProps {
  readonly collapsed?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems = [
    { label: 'Flight Management', path: '/admin/flights', icon: 'connecting_airports' },
    { label: 'Fare Classes', path: '/admin/fare-classes', icon: 'monetization_on' },
    { label: 'Ancillary Services', path: '/admin/services', icon: 'room_service' },
    { label: 'Bookings & PNRs', path: '/admin/bookings', icon: 'confirmation_number' }
  ] as const;

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  return (
    <aside className="w-64 bg-surface-container-low border-r border-outline-variant flex flex-col justify-between h-screen fixed left-0 top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-outline-variant flex items-center gap-space-sm bg-surface-container-lowest">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
          </div>
          <div>
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold block leading-none">
              SkyWing
            </span>
            <span className="text-[10px] font-semibold text-secondary uppercase tracking-widest">
              Ops Console
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-label-sm text-outline uppercase tracking-wider font-semibold">
            Operational Modules
          </div>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-label-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Session & Sign Out Footer */}
      <div className="p-4 border-t border-outline-variant bg-surface-container-lowest space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary text-[11px] font-bold flex items-center justify-center">
            AD
          </div>
          <div className="truncate">
            <span className="text-label-sm font-bold text-primary block leading-tight truncate">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-on-surface-variant font-mono">
              Role: System Dispatcher
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-label-sm font-semibold text-error border border-error/30 hover:bg-error-container/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Sign Out Console</span>
        </button>
      </div>
    </aside>
  );
};
