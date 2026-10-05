import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface TopNavBarProps {
  readonly currentPath?: string;
  readonly userDisplayName?: string;
  readonly isAuthenticated?: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  userDisplayName,
  isAuthenticated: propIsAuthenticated
}) => {
  const location = useLocation();
  const { user, isAuthenticated: authIsAuthenticated, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Use props if explicitly passed, otherwise use live auth state
  const isAuth = propIsAuthenticated !== undefined ? propIsAuthenticated : authIsAuthenticated;
  const displayName = userDisplayName || user?.name || 'Guest Traveler';

  const navLinks = [
    { label: 'Book Flight', path: '/' },
    { label: 'Flight Results', path: '/flights' },
    { label: 'Manage Booking', path: '/my-bookings' }
  ] as const;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant shadow-[0_1px_3px_rgba(13,71,161,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-lg">
        {/* Brand Logo */}
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="flex items-center gap-space-sm group">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                SkyWing
              </span>
              <span className="text-[10px] tracking-widest text-on-surface-variant uppercase font-semibold -mt-1">
                Airlines
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-space-xs ml-space-md">
            {navLinks.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-space-md py-space-sm rounded-lg transition-colors font-label-md text-label-md ${
                    isActive
                      ? 'bg-surface-container text-primary font-semibold'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center gap-space-md">
          <button
            type="button"
            aria-label="Notifications"
            className="relative p-space-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest" />
          </button>

          {isAuth ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container border border-outline-variant transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-medium text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-label-md font-semibold text-primary hidden sm:inline max-w-[120px] truncate">
                  {displayName}
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  {menuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* User Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-outline-variant">
                    <span className="text-label-sm font-bold text-primary block truncate">
                      {displayName}
                    </span>
                    <span className="text-[11px] text-on-surface-variant block truncate">
                      {user?.email || 'member@skywing.vn'}
                    </span>
                    {user?.tier && (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant">
                        SkyWing {user.tier}
                      </span>
                    )}
                  </div>

                  <Link
                    to="/my-bookings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">confirmation_number</span>
                    <span>My Bookings & Dossier</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-body-sm text-error hover:bg-error-container/20 transition-colors text-left border-t border-outline-variant mt-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center px-4 py-2 border border-secondary-container text-secondary font-label-md text-label-md font-semibold rounded-lg hover:bg-surface-container hover:text-on-secondary-container transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-colors"
              >
                Join Club
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
