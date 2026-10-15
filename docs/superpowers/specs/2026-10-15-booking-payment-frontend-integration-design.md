# Booking and payment frontend integration

## Intent and decisions

Connect the existing customer booking journey and booking lists to the Spring Boot API. A customer can select a real flight, fare, and ancillary services, create a booking, run the existing mock payment, and see the persisted result. Customers and admins see bookings stored by the backend rather than sample data.

Agreed scope:

- Support one-way bookings only. The backend stores one flight per booking; hide or disable round-trip and multi-city booking choices in this journey.
- Use the existing `POST /api/payments` endpoint and its mock gateway. This does not charge a real payment method.
- Include confirmation, My Bookings, and the admin booking list.
- Search and flight selection may remain public. Authentication is required when the customer attempts to select a fare and continue into the booking journey.
- The backend is authoritative for booking status and final amount.

## Existing seams

`FlightResultsPage` already fetches flights, but `useFlights` builds fare cards from local templates with code-like IDs. Fare and service APIs already exist. Each page currently calls `useBookingFlow` independently, so its local state resets at navigation. Checkout, confirmation, My Bookings, and the admin booking list currently generate or display mock bookings. `apiClient` already attaches the Supabase access token.

The backend already provides customer create/detail/list/cancel endpoints, an admin paginated list, payment processing, and ownership checks. It accepts numeric flight, fare, and service IDs. Booking starts `PENDING`; successful payment makes it `CONFIRMED`; failed payment makes it `PAYMENT_FAILED`. Only `PENDING` can be cancelled or paid. There is no refund, seat assignment, boarding pass, or real payment provider API in this scope.

## Frontend structure

1. Put one booking draft provider around the customer journey routes and make `useBookingFlow` read that shared state. Keep only unsaved selection and form inputs there. A fresh visit or reload before booking creation may restart the draft.
2. Add typed booking and payment API calls using the existing `apiClient`. Keep backend booking response fields in their API shape; map only where a presentational component needs it.
3. Fetch fares with `fareApi` and services with `serviceApi`, then expose only records where `active === true`. Fare cards retain their presentation metadata, but use the numeric backend fare ID and live multiplier/price. Preserve the raw `FlightApiModel.basePrice` for preview calculations; `useFlights` currently substitutes an economy price in its view model. Send numeric IDs and service quantities in the create request. The backend remains authoritative if a fare or service becomes inactive before submission and may reject the create request. Avoid mock fare or service IDs in submitted data.
4. Search and flight selection remain public. When a guest attempts to select a fare and continue into booking, send them to sign-in with the search URL as the return destination. Sign-in and auth callback return the customer to the results page; they select the fare and continue after returning. Admin redirects remain unchanged.
5. After a booking is created with a known response, persist its ID in the checkout URL and enter persisted-booking mode: stop treating the draft as authoritative and never call `POST /api/bookings` again for that checkout instance. A checkout loaded with a booking ID also starts in persisted-booking mode. Confirmation uses an ID in its URL and fetches `GET /api/bookings/{id}`. My Bookings fetches its list endpoint and loads detail on demand. Admin fetches its paginated list; admin detail renders only fields actually present on the selected admin-list record. Do not fetch or assume a separate admin detail endpoint. Persisted bookings are never reconstructed from draft state.

## Customer data flow

Search results show real flights and backend fares filtered to `active === true`. The passenger page collects the exact fields required by `BookingCreateRequest`: `fullName`, `dateOfBirth`, `passportNo`, and `phone`. Existing extra passenger inputs may remain for display but must not be presented as saved booking data. The services page shows backend services filtered to `active === true`, selected once each with quantity 1 for the current toggle UI. The backend remains authoritative if a fare or service becomes inactive before submission.

The price preview uses `flight.basePrice × fare.priceMultiplier × passenger count + sum(service.price × quantity)`. Remove the frontend's fabricated 12% tax line. This preview is informational; the returned `BookingResponse.totalPrice` is displayed before the payment action.

Checkout has two steps: create the booking with `POST /api/bookings`, then show the persisted `PENDING` booking and its final amount before the user invokes `POST /api/payments` with `{ bookingId, paymentMethod: "MOCK" }`. Disable submission during each request. Once create returns a booking ID, enter persisted-booking mode immediately; payment retries and reload recovery reuse that ID and never call create again for this checkout instance. Replace the card, QR, wallet, encryption, and certification claims with an explicit demo payment control; no card details are collected. On `CONFIRMED`, navigate to `/confirmation/{bookingId}`. Show a success message only after reading the confirmed booking from the backend.

If checkout reloads after booking creation, its URL ID restores the persisted booking. On an uncertain payment response, read the booking status before offering another action: `CONFIRMED` goes to confirmation, `PENDING` can retry payment, and `PAYMENT_FAILED` shows failure and requires a new booking. A payment response of `FAILED` follows the same terminal failure path. Do not create another booking merely because payment transport failed.

Treat a timeout, connection loss, malformed response, or HTTP 5xx from `POST /api/bookings` after dispatch as an unknown outcome. Never automatically retry that POST and do not show a retry button on the same draft, because the backend may already have committed the booking and has no idempotency key. A definitive validation/authentication 4xx response is a known rejection and can be corrected before a new submit. For unknown outcomes, send the customer to My Bookings to inspect the authoritative list; do not guess-match a booking by its fields. If the customer cannot determine whether it was created, require support/manual resolution before starting another booking.

## Booking lists and display

My Bookings reads `GET /api/bookings/me` for cards/list and filters the actual backend statuses. Opening a booking fetches `GET /api/bookings/{id}` for its passenger, services, payment, and price breakdown detail. Only `PENDING` shows a cancel action; `PATCH /api/bookings/{id}/cancel` updates the displayed booking after success. Remove refund language because cancellation does not refund a payment.

The admin page reads `GET /api/bookings` with backend pagination and optional status filtering. Search by booking code or passenger within the loaded page is local unless a matching backend filter exists; do not imply global search. Admin detail renders only fields actually present on the selected admin-list record; do not fetch or assume a separate admin detail endpoint. Remove admin refund/cancel actions because no admin mutation endpoint exists.

Confirmation, booking cards, and dossier display only fields in `BookingResponse`: booking code/status, route and departure, fare name, passenger names, selected services, price breakdown, and payment status when present. Remove or relabel mock-only gate, seat, passenger email, boarding pass, ticket issuance, completed status, and refunded status claims. A confirmed booking is a confirmed reservation, not proof of an issued ticket.

## Errors and boundaries

- Keep the customer on the current step and show API errors for missing/invalid selection, create failure, payment failure, list load failure, and cancel conflict. If the backend amount differs from the preview, show the backend amount before payment.
- Treat an uncertain create response as unknown outcome: never automatically repeat `POST /api/bookings`, and direct the customer to My Bookings for reconciliation. Do not infer that no booking exists from the missing response.
- On HTTP 409 from payment or cancellation, refetch `GET /api/bookings/{id}` and render the authoritative current booking/status. For payment, route `CONFIRMED` to confirmation, keep `PENDING` eligible for an explicit payment attempt, and show `PAYMENT_FAILED` as terminal. For cancellation, reflect the fetched status and show a conflict only if the refreshed state still requires explanation.
- Never display confirmation from local state or mock fallback. An invalid or inaccessible booking ID shows a recoverable error with a link to My Bookings.
- Prevent duplicate requests while a call is in progress. A known booking ID is reused for payment and status checks.
- Backend validation, ownership checks, state transitions, and final amount remain authoritative. The frontend sends only data required by the existing contracts.

## Acceptance and review

The integrated journey can select a real one-way flight, a fare with `active === true`, enter a passenger with the exact request fields, choose services with `active === true`, create a `PENDING` booking, inspect the backend amount, run mock payment, and see the persisted booking in confirmation and My Bookings. The My Bookings list uses `/me`; opening a booking fetches its owner-scoped detail. The admin list and its detail view use only fields present in the admin-list payload. Once a booking ID is received, checkout stays in persisted-booking mode and never creates again for that checkout instance. A `PENDING` booking can be cancelled from My Bookings. A failed or interrupted payment does not display success or silently create a duplicate booking. An uncertain create response never repeats the create request and sends the customer to My Bookings for reconciliation. Payment and cancellation 409 responses trigger a booking refetch and display its authoritative state. Guest sign-in returns to flight selection. Unsupported payment, refund, and ticket claims are absent.

Review the existing frontend auth, fare/service, and page contracts while implementing. Check the journey against the scenarios above and preserve unrelated changes already in the worktree. No real payment provider, refund, inventory reservation, return flight, multi-city booking, or backend schema change is part of this design.
