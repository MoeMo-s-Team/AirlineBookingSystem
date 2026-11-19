import type { NotificationModel } from '../api/notificationApi';

export function notificationBookingPath(notification: Pick<NotificationModel, 'type' | 'bookingId'>): string {
  return notification.type === 'ADMIN_BOOKING_CREATED'
    ? `/admin/bookings?bookingId=${notification.bookingId}`
    : `/my-bookings/${notification.bookingId}`;
}
