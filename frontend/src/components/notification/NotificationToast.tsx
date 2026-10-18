import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export function NotificationToast() {
  const { toast, dismissToast } = useNotifications();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, 8_000);
    return () => window.clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 left-4 right-4 z-[60] rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-xl sm:left-auto sm:w-96">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label-md font-bold text-primary">New booking update</p>
          <p className="mt-1 break-words text-body-sm text-on-surface">{toast.message}</p>
        </div>
        <button type="button" onClick={dismissToast} aria-label="Dismiss notification" className="text-on-surface-variant hover:text-primary">×</button>
      </div>
      {toast.bookingId !== null && (
        <Link
          to={`/my-bookings/${toast.bookingId}`}
          onClick={dismissToast}
          className="mt-3 inline-block text-label-md font-semibold text-secondary hover:underline"
        >
          View booking
        </Link>
      )}
    </div>
  );
}
