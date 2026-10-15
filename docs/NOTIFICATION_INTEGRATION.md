# Notification integration

Notification is implemented as in-app messages for booking status changes. The database table already exists in `backend/src/main/resources/db/init.sql`; no new migration is required.

## API contract

All endpoints require a Supabase access token in `Authorization: Bearer <token>`. The backend derives the profile UUID from the verified JWT subject. The client must not send a `userId`.

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/notifications?isRead=&limit=20&offset=0` | `{success,data,pagination}`; newest first, `limit` 1–100 |
| GET | `/api/notifications/unread-count` | `{success,data:{count}}` |
| PATCH | `/api/notifications/{id}/read` | `{success,data:{id,isRead}}`; another user's ID returns 404 |
| PATCH | `/api/notifications/read-all` | `{success,data:{updatedCount}}`; updates only the signed-in user's unread rows |

The frontend uses `VITE_API_URL` and passes the access token only in the request header. The token is not stored by the Notification module.

## Auth integration

`AuthContext` obtains the Supabase session and exposes `getAccessToken()`. The Notification provider uses the current access token, refreshes after sign-in and every 60 seconds while authenticated, and clears notification state on sign-out. Opening the bell or pressing Refresh fetches current data immediately. A new unread notification seen after the initial load appears as a dismissible toast. A missing session never triggers a request with a fabricated user ID.

## Booking integration

`BookingService.createBooking` publishes a creation event, `BookingService.cancelBooking` publishes a cancellation event, and `PaymentService.processPayment` publishes confirmation or payment failure after changing the booking status. Each call is inside the booking transaction. `BookingSubject` ignores unchanged statuses.

```java
BookingStatus previousStatus = booking.getStatus();
booking.setStatus(nextStatus);
bookingRepository.save(booking);
bookingSubject.publishStatusChanged(booking, previousStatus);
```

`InAppNotificationObserver` writes `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, and `PAYMENT_FAILED` messages. The creation message reminds the customer that payment is pending. The notification participates in the same transaction and rolls back with the booking. The frontend booking journey on this branch still contains mock booking data; create and change bookings through the backend API when manually verifying notification delivery. Notification items open `/my-bookings/{id}`, a read-only page backed by the owner-scoped `GET /api/bookings/{id}` endpoint. A different user's booking ID cannot be opened.

## Local verification

```powershell
cd backend
mvn test

cd ../frontend
pnpm test --run
pnpm build
```

Sign in as two different users and create a booking through `POST /api/bookings` using a valid customer token. Open the bell or press Refresh on `/notifications`; `BOOKING_CREATED` should appear for the booking owner only. Process its payment through `POST /api/payments`, or cancel it through `PATCH /api/bookings/{id}/cancel`, then refresh to see the corresponding message and toast. Open a notification to view its related booking. Mark one as read, then use Mark all as read and confirm the unread badge decreases to zero. Another user's notification ID must return 404 on the read endpoint, and read-all must not change their rows. Do not put access tokens into screenshots, logs, or committed files.
