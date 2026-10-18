import React from 'react';
import { Link } from 'react-router-dom';
import { NotificationModel } from '../../api/notificationApi';

interface NotificationItemProps {
  readonly notification: NotificationModel;
  readonly onMarkRead: (id: number) => void;
  readonly saving?: boolean;
}

const TITLES: Record<string, string> = {
  BOOKING_CREATED: 'Booking created',
  BOOKING_CONFIRMED: 'Booking confirmed',
  BOOKING_CANCELLED: 'Booking cancelled',
  PAYMENT_FAILED: 'Payment unsuccessful'
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, saving = false }) => {
  const createdAt = new Date(notification.createdAt);
  const dateLabel = Number.isNaN(createdAt.getTime())
    ? notification.createdAt
    : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(createdAt);

  return (
    <article className={`px-4 py-4 sm:px-5 border-b border-outline-variant last:border-b-0 ${notification.isRead ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}`}>
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${notification.isRead ? 'bg-surface-container text-on-surface-variant' : 'bg-primary-fixed text-primary'}`}>
          <span className="material-symbols-outlined text-[19px]">
            {notification.type === 'PAYMENT_FAILED' ? 'error' : 'confirmation_number'}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            {notification.bookingId !== null ? (
              <Link
                to={`/my-bookings/${notification.bookingId}`}
                onClick={() => { if (!notification.isRead) onMarkRead(notification.id); }}
                className="text-body-sm font-semibold text-primary hover:underline focus-visible:underline"
              >
                {TITLES[notification.type] ?? 'Booking update'}
                {!notification.isRead && <span className="sr-only">, unread</span>}
              </Link>
            ) : (
              <h3 className="text-body-sm font-semibold text-primary">
                {TITLES[notification.type] ?? 'Booking update'}
                {!notification.isRead && <span className="sr-only">, unread</span>}
              </h3>
            )}
            {!notification.isRead && <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />}
          </div>
          <p className="mt-1 text-body-sm text-on-surface break-words">{notification.message}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-label-md">
            <time dateTime={notification.createdAt} className="text-on-surface-variant">{dateLabel}</time>
            {notification.bookingId !== null && (
              <Link to={`/my-bookings/${notification.bookingId}`} onClick={() => { if (!notification.isRead) onMarkRead(notification.id); }} className="font-semibold text-secondary hover:underline">View booking #{notification.bookingId}</Link>
            )}
            {!notification.isRead && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onMarkRead(notification.id)}
                className="font-semibold text-secondary hover:underline focus-visible:underline focus-visible:outline-none disabled:opacity-50 disabled:no-underline"
              >
                {saving ? 'Saving…' : 'Mark as read'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
