# Notification integration

Notification is implemented as in-app messages for booking status changes. The database table already exists in `backend/src/main/resources/db/init.sql`; no new migration is required.

## API contract

All endpoints require a Supabase access token in `Authorization: Bearer <token>`. The backend derives the profile UUID from the verified JWT subject. The client must not send a `userId`.

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/notifications?isRead=&limit=20&offset=0` | `{success,data,pagination}`; newest first, `limit` 1–100 |
| GET | `/api/notifications/unread-count` | `{success,data:{count}}` |
| PATCH | `/api/notifications/{id}/read` | `{success,data:{id,isRead}}`; another user's ID returns 404 |

The frontend uses `VITE_API_URL` and passes the access token only in the request header. The token is not stored by the Notification module.

## Auth handoff

`AuthContextType` has an optional method:

```ts
getAccessToken?: () => Promise<string | null>;
```

When the Supabase Auth implementation replaces the current mock context, provide that method using the current Supabase session. The Notification provider refreshes its preview and unread count after sign-in and every 60 seconds while authenticated. Until a valid token is available, the UI explains that notifications are unavailable; it never sends the mock user's ID to the API or shows fabricated notifications.

## Booking handoff

Inject `BookingSubject` into the booking application service. After a new booking is saved, call `publishStatusChanged(booking, null)`. On a real status transition, capture the old status, persist the new status and call `publishStatusChanged(booking, oldStatus)` within the same booking transaction. Do not call it when the status has not changed.

```java
BookingStatus previousStatus = booking.getStatus();
booking.setStatus(nextStatus);
bookingRepository.save(booking);
bookingSubject.publishStatusChanged(booking, previousStatus);
```

`InAppNotificationObserver` writes `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, and `PAYMENT_FAILED` messages. When the subject is called inside the booking transaction, the notification participates in that transaction and rolls back with the booking. The current `main` branch has no booking application service yet, so this call site belongs to the Booking module owner when that module lands.

## Local verification

```powershell
cd backend
mvn test

cd ../frontend
pnpm build
```

After Supabase Auth and Booking are integrated, sign in as two different users. Confirm that each only sees their own notifications, marking one as read updates the badge, and another user's notification ID returns 404.
