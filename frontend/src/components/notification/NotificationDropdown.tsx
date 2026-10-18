import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  readonly onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { isAuthenticated } = useAuth();
  const { preview, status, error, refresh, markRead } = useNotifications();
  const [savingId, setSavingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleMarkRead = async (id: number) => {
    setSavingId(id);
    setActionError(null);
    try {
      await markRead(id);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not update notification.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div id="notification-popover" role="region" aria-label="Notifications" className="fixed left-4 right-4 top-[4.5rem] z-50 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
        <h2 className="text-headline-sm font-semibold text-primary">Notifications</h2>
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => { void refresh(); }}
            disabled={status === 'loading'}
            aria-label="Refresh notifications"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[19px]">refresh</span>
          </button>
        )}
      </div>

      <div className="max-h-[min(24rem,60vh)] overflow-y-auto" aria-live="polite">
        {!isAuthenticated && (
          <div className="px-5 py-7">
            <p className="text-body-sm text-on-surface-variant">Sign in to see updates about your bookings.</p>
            <Link
              to="/sign-in"
              onClick={onClose}
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary"
            >
              Sign in
            </Link>
          </div>
        )}
        {isAuthenticated && status === 'loading' && preview.length === 0 && (
          <div className="space-y-3 p-4" role="status" aria-label="Loading notifications">
            {[1, 2, 3].map(row => <div key={row} className="h-16 animate-pulse rounded-lg bg-surface-container" />)}
          </div>
        )}
        {isAuthenticated && status === 'unavailable' && (
          <p className="px-5 py-8 text-body-sm text-on-surface-variant">Your session is unavailable. Sign in again to view notifications.</p>
        )}
        {isAuthenticated && status === 'error' && (
          <div className="px-5 py-6 text-body-sm text-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => { void refresh(); }} className="mt-2 font-semibold underline">Try again</button>
          </div>
        )}
        {isAuthenticated && status === 'ready' && preview.length === 0 && (
          <div className="px-5 py-9 text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-[28px] text-secondary">notifications_none</span>
            <p className="mt-2 text-body-sm font-semibold text-primary">You're all caught up</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">Booking updates will appear here.</p>
          </div>
        )}
        {isAuthenticated && (status === 'ready' || status === 'loading') && preview.map(item => (
          <NotificationItem key={item.id} notification={item} onMarkRead={id => { void handleMarkRead(id); }} saving={savingId === item.id} />
        ))}
        {isAuthenticated && actionError && <p role="alert" className="px-4 py-3 text-body-sm text-error">{actionError}</p>}
      </div>
      {isAuthenticated && (
        <Link
          to="/notifications"
          onClick={onClose}
          className="block border-t border-outline-variant px-4 py-3 text-center text-label-md font-semibold text-secondary hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          View all notifications
        </Link>
      )}
    </div>
  );
};
