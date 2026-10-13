# Booking and Payment Backend Design

**Date:** 2026-10-13  
**Status:** Conversational design approved; awaiting written spec review

## Goal

Implement the backend business flow for booking creation, lookup, cancellation, and mock payment in the existing Spring Boot application. Keep the existing layer boundaries, Supabase JWT authentication, pricing strategy, and booking notification observer.

## Scope

- Customer creates a booking, reads a booking or their booking history, and cancels their own pending booking.
- Admin lists bookings. Admin status mutation is outside the demo scope.
- Customer pays for their own pending booking through a mock gateway.
- The backend calculates and persists booking and payment amounts.
- Booking status changes use the State Pattern and publish existing observer notifications.
- Reconcile the SRS/API documentation with the agreed demo behavior: remove `PATCH /api/bookings/{id}/status` from both the endpoint summary and detailed contract, remove the `PAYMENT_FAILED` retry line from the detailed contract, and document bearer authentication plus owner-only access for booking detail.

Out of scope: real payment processing, retries, refunds, webhooks, seat holds/inventory updates, frontend changes, email/SMS, and payment idempotency keys.

## Architecture

- `BookingController` and `PaymentController` expose validated REST DTOs and the existing `ApiResponse` envelope.
- `BookingService` owns booking creation, customer/admin reads, and pending-only cancellation.
- `PaymentService` owns payment orchestration and status updates caused by the gateway result.
- Add `BookingRepository` and `PaymentRepository`. Reuse flight, fare-class, service, and profile data already in the domain.
- Add a small State Pattern implementation under `pattern/state`; no booking state package exists in the current source tree.
- Reuse `BookingSubject` and `InAppNotificationObserver`. Add a small `MockPaymentGateway` whose outcome comes from backend configuration and defaults to `SUCCESS`.

The authenticated Supabase profile UUID is the source of customer ownership. Client requests never supply `userId`, amount, or booking/payment status. Admin listing requires the existing `ADMIN` role.

## API and data contract

Keep these SRS routes in the demo:

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/bookings` | Customer |
| GET | `/api/bookings/{id}` | Bearer token; owning customer only |
| GET | `/api/bookings/me` | Customer; optional status filter |
| PATCH | `/api/bookings/{id}/cancel` | Owning customer; only while `PENDING` |
| GET | `/api/bookings` | Admin; status/user filters and pagination |
| POST | `/api/payments` | Owning customer; booking must be `PENDING` |

Do not expose `PATCH /api/bookings/{id}/status` in this demo. Payment success/failure and pending-only cancellation are the only status mutation paths.

`GET /api/bookings/{id}` requires `Authorization: Bearer <access_token>`. The backend returns a booking only to its owner; another user's booking ID returns `404`.

Booking create accepts flight/fare IDs, passenger details, and optional service IDs with quantities. The backend loads current flight, fare, and active service prices, calculates the total, and snapshots each selected service's unit price in `booking_services`. Payment create accepts only `bookingId` and `paymentMethod`; amount comes from `Booking.totalPrice`.

Persist to the existing `bookings`, `passengers`, `booking_services`, and `payments` schema. The current entities and init schema cover the required fields, so no database migration is expected. Booking price is the sum of each passenger's flight base price multiplied by the selected fare multiplier, plus each service snapshot price multiplied by quantity.

## State and transaction rules

Allowed transitions for the demo:

```text
PENDING → CONFIRMED       payment SUCCESS
PENDING → PAYMENT_FAILED  payment FAILED (terminal)
PENDING → CANCELLED       customer cancellation (terminal)
```

`PaymentService` accepts only a `PENDING` booking. A failed payment attempt is persisted with `PaymentStatus.FAILED`, and the booking becomes terminal `PAYMENT_FAILED`; no retry path exists. A successful attempt is persisted with `PaymentStatus.SUCCESS` and confirms the booking.

Create booking, payment, and cancellation each run in a database transaction. Payment and cancellation lock the booking row before checking ownership/status. This makes concurrent pay/cancel serialize: whichever commits first succeeds; the other sees a non-pending booking and fails with conflict. A failed gateway result is a normal committed business outcome. Unexpected persistence/observer errors roll back the booking/payment/notification changes together.

After saving a newly created `PENDING` booking, call `BookingSubject.publishStatusChanged(booking, null)` once. For cancellation/payment, publish only after a real status change is persisted. A no-op transition emits no event. A single actual transition produces one notification; duplicate notification persistence across independently repeated observer invocations is not an idempotency feature in this scope.

## Validation and errors

- Require existing flight and fare IDs; require at least one passenger; validate passenger fields and positive service quantities.
- **Additional demo business rule (not an existing SRS Create Booking validation):** reject an inactive fare class or inactive additional service. Add this rule explicitly when synchronizing the SRS.
- Reject requests that attempt to supply server-owned values.
- Use owner-scoped booking reads/mutations so another customer's booking is not disclosed.
- Return `400` for request validation, `404` for missing or non-owned booking, `409` for invalid state/concurrent mutation, and preserve the existing `401`/`403` security behavior.
- Payment methods remain the documented mock values (`CREDIT_CARD`, `BANK_TRANSFER`, `MOCK`). No card credentials are persisted.

## Verification and implementation order

1. Add repositories, request/response DTOs, state transitions, and a conflict exception mapping.
2. Implement booking create/read/history/admin list/cancel with server-side pricing and service price snapshots.
3. Implement configured mock gateway and payment persistence/status transitions.
4. Wire ownership/role checks, observer publication, and OpenAPI routes.
5. Reconcile the SRS/demo API contract: remove the status-update route from both the API summary and detailed contract, remove the `PAYMENT_FAILED` retry line, document bearer/owner checks for booking detail, and mark the inactive fare/service validation as an added demo rule. Then run backend verification.

Required tests:

- Booking creation rejects invalid references/passengers/quantities and inactive fare/services, calculates price from persisted prices, and snapshots service unit prices.
- Customer cannot read, cancel, or pay for another user's booking; admin listing requires `ADMIN`.
- Only `PENDING` can be cancelled or paid. Payment success confirms; failure persists `PAYMENT_FAILED`; subsequent payment attempts are rejected.
- Pay and cancel submitted concurrently for one pending booking result in exactly one successful operation.
- Booking creation publishes once with `oldStatus = null`; an unchanged status publishes no event; a single real transition creates one notification and no duplicate notification.
- Mock result configuration defaults to `SUCCESS` and exercises both success/failure paths.

The repository currently has no test database configuration. The concurrency test must run against PostgreSQL (preferably an isolated PostgreSQL Testcontainers fixture) so it verifies the row-lock behavior used by Supabase PostgreSQL.

## Known limit

The demo does not reserve or decrement flight seats. Concurrent bookings can therefore exceed the flight's available-seat count until seat inventory is separately designed.
