# Booking and Payment Frontend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the one-way customer booking journey, payment, confirmation, My Bookings, and admin booking list to the existing backend APIs.

**Architecture:** Reuse `apiClient` and its Supabase token handling. Keep only the unsaved booking draft in a route-shared React context; once the backend returns a booking ID, load and mutate that persisted booking by ID. Use separate summary/detail types so customer history can load cards first and admin detail never assumes a separate endpoint.

**Tech Stack:** React 19, TypeScript 5.7, React Router 7, Spring Boot REST contracts, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-15-booking-payment-frontend-integration-design.md`

## Global Constraints

- Support one-way bookings only.
- Use `POST /api/payments` with the existing mock gateway; this does not charge a real payment method.
- Search and flight selection may remain public. Authentication is required when the customer attempts to select a fare and continue into the booking journey.
- The backend is authoritative for booking status and final amount.
- Only expose fares and services where `active === true`; the backend remains authoritative if an item becomes inactive before submission.
- Never automatically retry an uncertain `POST /api/bookings` outcome; direct the customer to My Bookings for manual verification.
- After receiving a booking ID, checkout stays in persisted-booking mode and never creates again for that checkout instance.
- My Bookings detail uses `GET /api/bookings/{id}`; admin detail uses only fields present on the selected admin-list record.
- Do not add a real payment provider, refund behavior, inventory reservation, return flight, multi-city booking, or backend schema change.

## Review Focus

- Guest return target is a same-origin path; reject absolute or protocol-relative URLs. Test in Task 2 with `safeReturnTo rejects external and protocol-relative targets`.
- A request-dispatched booking create that times out, returns malformed data, or returns HTTP 5xx may have committed; never send a second create for the same draft. Test in Task 3 with `unknown create outcome blocks resubmission and opens My Bookings`.
- A definitive create 4xx is a known rejection that can be corrected; do not permanently lock that draft. Test in Task 3 with `known create rejection leaves the corrected draft submit-able`.
- Payment or cancellation can race with another state change; a 409 must refetch the booking and render the returned state. Test payment in Task 3 and cancellation in Task 4.
- Admin list records may omit nested detail fields; render only fields present and do not issue a booking-detail request. Test in Task 4 with `admin dossier uses available list fields without a detail request`.

---

### Task 1: Booking and Payment API Contracts

**Files:**
- Create: `frontend/src/api/bookingApi.ts`
- Create: `frontend/src/api/paymentApi.ts`
- Modify: `frontend/src/api/apiClient.ts`
- Modify: `frontend/src/api/index.ts`
- Test: `frontend/src/api/bookingApi.test.ts`
- Test: `frontend/src/api/paymentApi.test.ts`
- Test: `frontend/src/api/apiClient.test.ts`

**Interfaces:**
- `bookingApi.createBooking(request: CreateBookingRequest): Promise<BookingDetail>` posts to `/bookings`.
- `bookingApi.getMyBookings(status?: BookingStatus): Promise<BookingSummary[]>` gets `/bookings/me`.
- `bookingApi.getBooking(id: number): Promise<BookingDetail>` gets `/bookings/{id}`.
- `bookingApi.cancelBooking(id: number): Promise<CancelBookingResponse>` patches `/bookings/{id}/cancel`; `CancelBookingResponse` contains only `id`, `bookingCode`, and `status`.
- `bookingApi.getAdminBookings(query: AdminBookingQuery): Promise<AdminBookingPage<AdminBookingListRecord>>` gets `/bookings` with `page`, `size`, and optional `status`/`userId`; `AdminBookingPage<T>` is `{ data: T[]; pagination: AdminBookingPagination }`, where `AdminBookingPagination` is `{ total: number; page: number; size: number; totalPages: number }`.
- `paymentApi.processPayment(request: { bookingId: number; paymentMethod: 'MOCK' }): Promise<PaymentResponse>` posts to `/payments`.
- `apiClient.patch<T>(endpoint: string, body?: unknown): Promise<T>` mirrors the existing `post` wrapper with HTTP `PATCH`.
- `apiClient.getEnvelope<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<T>` returns the full parsed JSON envelope without unwrapping `data`; ordinary API methods continue returning `data`.
- `AdminBookingEnvelope<T> = ApiResponse<T[]> & { pagination: AdminBookingPagination }`; `bookingApi` returns its `data` and `pagination` while dropping only the success/message envelope fields.
- `CreateBookingRequest` uses numeric `flightId`, `fareClassId`, numeric `serviceId`, and passenger properties exactly `fullName`, `dateOfBirth`, `passportNo`, and `phone`.
- `BookingStatus` is `'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PAYMENT_FAILED'`; `PaymentStatus` is `'SUCCESS' | 'FAILED'`.
- `BookingDetail` follows the current `BookingResponse` shape. `BookingSummary` includes only fields needed by customer cards. `AdminBookingListRecord` requires its record ID and treats other displayed/nested fields as optional. The admin response uses root-level `data` and `pagination`; do not model it as Spring `Page<T>` (`content`, `number`, or `totalElements`).

- [ ] **Step 1: Write API contract tests**

Test the exact endpoint/method/body for create, payment, cancel, and admin list; assert list status is omitted when undefined. Assert create preserves numeric IDs and the exact four passenger field names. Assert API wrappers return the data unwrapped from `ApiResponse`, and `getEnvelope` preserves the admin response's `success`, `data`, and root `pagination` fields. Use a minimal cancel response fixture with only `id`, `bookingCode`, and `status`.

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run from `frontend/`: `pnpm exec vitest run src/api/bookingApi.test.ts src/api/paymentApi.test.ts src/api/apiClient.test.ts`
Expected: FAIL because the API modules, `apiClient.patch`, and envelope-preserving API method do not exist.

- [ ] **Step 3: Implement the API contracts**

Add the API modules and exported response/request types, add `apiClient.patch` and `apiClient.getEnvelope`, and export both modules from `api/index.ts`. Reuse `apiClient`; do not add a second fetch client or retry behavior.

- [ ] **Step 4: Run API and client tests**

Run from `frontend/`: `pnpm exec vitest run src/api/bookingApi.test.ts src/api/paymentApi.test.ts src/api/apiClient.test.ts`
Expected: all focused tests pass, including an assertion that cancel uses HTTP `PATCH`.

- [ ] **Step 5: Commit the API slice**

```bash
git add frontend/src/api
git commit -m "feat: add booking and payment API clients"
```

### Task 2: Shared Draft, One-Way Search, and Auth Return

**Files:**
- Create: `frontend/src/context/BookingFlowContext.tsx`
- Create: `frontend/src/utils/safeReturnTo.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/hooks/useBookingFlow.ts`
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/components/flight/FlightSearchForm.tsx`
- Modify: `frontend/src/pages/FlightResultsPage.tsx`
- Modify: `frontend/src/pages/SignInPage.tsx`
- Modify: `frontend/src/pages/SignUpPage.tsx`
- Modify: `frontend/src/context/AuthContext.tsx`
- Modify: `frontend/src/pages/AuthCallbackPage.tsx`
- Test: `frontend/src/context/BookingFlowContext.test.tsx`
- Test: `frontend/src/utils/safeReturnTo.test.ts`
- Update: `frontend/src/pages/SignInPage.test.tsx`
- Update: `frontend/src/pages/SignUpPage.test.tsx`
- Update: `frontend/src/pages/AuthCallbackPage.test.tsx`
- Update: `frontend/src/context/AuthContext.test.tsx`

**Interfaces:**
- `BookingFlowProvider({ children }: { children: React.ReactNode }): JSX.Element` owns one customer draft across search, auth return, and booking routes for the lifetime of the app route tree.
- `useBookingFlow()` moves the current draft operations (`searchParams`, `setSearchParams`, selected flight/fare setters, passenger state/update, selected services/toggle) into shared context. Keep legacy checkout return fields until Task 3 replaces their consumers.
- `safeReturnTo(value: string | null, fallback: string): string` accepts only same-origin relative paths and rejects `//host` and absolute URLs.
- Sign-in and auth callback read a `returnTo` query value, validate it through `safeReturnTo`, and preserve current role routing for admins. Sign-up carries the same return target through its email callback URL.
- `FlightSearchParams.tripType` is `'one-way'`; remove the round-trip and multi-city tabs and return-date behavior from the customer search journey.

- [ ] **Step 1: Write draft and return-path tests**

Assert draft values survive navigation between route consumers and initialize without mock selections or a confirmed booking. Assert `safeReturnTo('/flights?...')` preserves the local URL and rejects `https://example.com` and `//example.com`.

- [ ] **Step 2: Update auth navigation tests and verify failure**

Update SignIn/SignUp/AuthCallback/AuthContext tests to carry `returnTo` through password sign-in and email confirmation; expect customers to return to that local URL and admins to remain at `/admin/flights`. Run from `frontend/`: `pnpm exec vitest run src/context/BookingFlowContext.test.tsx src/utils/safeReturnTo.test.ts src/pages/SignInPage.test.tsx src/pages/SignUpPage.test.tsx src/pages/AuthCallbackPage.test.tsx src/context/AuthContext.test.tsx`.
Expected: FAIL for missing provider/return-path behavior and the old customer redirect expectations.

- [ ] **Step 3: Implement the shared draft and auth return flow**

Wrap search, auth-return, and booking routes in `BookingFlowProvider`, make `useBookingFlow` consume it, and update fare-selection navigation to sign in with the current results URL for guests. Return signed-in customers to results so they can select the fare and proceed. Carry the local destination through SignUp email callback as well.

- [ ] **Step 4: Restrict search to one-way and run focused tests**

Remove trip-type selection and return-date display, initialize `tripType` as `'one-way'`, and add reset behavior for a deliberately new booking journey. Run the focused command from Step 2.
Expected: all focused tests pass, including guest return and unchanged admin routing.

- [ ] **Step 5: Commit the draft/auth slice**

```bash
git add frontend/src/App.tsx frontend/src/context frontend/src/hooks/useBookingFlow.ts frontend/src/types/index.ts frontend/src/utils frontend/src/components/flight/FlightSearchForm.tsx frontend/src/pages/FlightResultsPage.tsx frontend/src/pages/SignInPage.tsx frontend/src/pages/SignInPage.test.tsx frontend/src/pages/SignUpPage.tsx frontend/src/pages/SignUpPage.test.tsx frontend/src/pages/AuthCallbackPage.tsx frontend/src/pages/AuthCallbackPage.test.tsx
git commit -m "feat: share booking draft across customer routes"
```

### Task 3: Complete the Live Customer Booking and Payment Journey

**Files:**
- Create: `frontend/src/types/bookingFlow.ts`
- Modify: `frontend/src/hooks/useFlights.ts`
- Modify: `frontend/src/context/BookingFlowContext.tsx`
- Modify: `frontend/src/hooks/useBookingFlow.ts`
- Modify: `frontend/src/components/flight/FlightCard.tsx`
- Modify: `frontend/src/components/flight/FareTierCard.tsx`
- Modify: `frontend/src/components/service/ServiceCard.tsx`
- Modify: `frontend/src/components/passenger/PassengerForm.tsx`
- Modify: `frontend/src/components/booking/PriceSummaryCard.tsx`
- Modify: `frontend/src/pages/FlightResultsPage.tsx`
- Modify: `frontend/src/pages/PassengerInfoPage.tsx`
- Modify: `frontend/src/pages/AdditionalServicesPage.tsx`
- Modify: `frontend/src/pages/CheckoutPaymentPage.tsx`
- Modify: `frontend/src/pages/BookingConfirmationPage.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/hooks/useFlights.test.ts`
- Test: `frontend/src/pages/PassengerInfoPage.test.tsx`
- Test: `frontend/src/pages/AdditionalServicesPage.test.tsx`
- Test: `frontend/src/components/booking/PriceSummaryCard.test.tsx`
- Test: `frontend/src/pages/CheckoutPaymentPage.test.tsx`
- Test: `frontend/src/pages/BookingConfirmationPage.test.tsx`

**Interfaces:**
- `BookingFlightSelection = Omit<Flight, 'id' | 'fareClasses'> & { id: number; fareClasses: BookingFareOption[] }`.
- `BookingFareOption = Omit<FareClass, 'id'> & { id: number; code: string; priceMultiplier: number; price: number }`. Do not stringify or duplicate IDs. Unknown fare codes show backend name and price without mock benefits.
- `BookingPassengerDraft` contains exactly `fullName`, `dateOfBirth`, `passportNo`, and `phone`.
- Draft selected services use backend `ServiceResponse` records, retaining numeric IDs and submitting `quantity: 1`.
- Create body is `{ flightId: number; fareClassId: number; passengers: BookingPassengerDraft[]; services: { serviceId: number; quantity: 1 }[] }`.
- Payment body is `{ bookingId: number; paymentMethod: 'MOCK' }`.
- Checkout state is `draft | creating | create-unknown | persisted-pending | paying | payment-failed | confirmed`; query `bookingId` always selects persisted mode.

- [ ] **Step 1: Write customer-flow and checkout tests**

Assert inactive fares/services are excluded unless `active === true`; flight, fare, and service selections retain numeric backend IDs directly in `id` without parallel mock/backend ID fields; fare prices use raw `basePrice * priceMultiplier`; unknown fare codes do not inherit mock benefits. Assert the passenger form emits exactly the four backend fields and the price preview has no fabricated tax. Cover booking request fields, returned ID persistence, backend amount before payment, payment method `MOCK`, no card collection, and no second create once an ID exists. Cover unknown create outcomes blocking same-draft submission, definitive 4xx allowing correction, payment 409 refetch, and `PENDING`/`CONFIRMED`/`PAYMENT_FAILED` behavior.

Name the safety tests `unknown create outcome blocks resubmission and opens My Bookings`, `known create rejection leaves the corrected draft submit-able`, and `payment 409 refetches and follows the authoritative status`.

- [ ] **Step 2: Run focused tests and confirm they fail**

Run from `frontend/`: `pnpm exec vitest run src/hooks/useFlights.test.ts src/pages/PassengerInfoPage.test.tsx src/pages/AdditionalServicesPage.test.tsx src/components/booking/PriceSummaryCard.test.tsx src/pages/CheckoutPaymentPage.test.tsx src/pages/BookingConfirmationPage.test.tsx`
Expected: FAIL because selection, checkout, and confirmation still use mock data.

- [ ] **Step 3: Map backend flight, fare, and service records into the shared draft**

Preserve the raw flight base price and each numeric backend ID directly in the booking-flow entity's `id`; do not stringify IDs or keep separate mock/backend ID properties. Update flight/fare component props and booking-flow state to these numeric-ID types. Fetch fares/services through existing APIs and expose only records with `active === true`; derive fare display price from the multiplier and use existing UI templates only for matching display details. Keep numeric service IDs and selected service records in context.

- [ ] **Step 4: Wire passenger fields and preview to the backend contract**

Use `fullName`, `dateOfBirth`, `passportNo`, and `phone`, validate required values, and create one service line with quantity 1 per selected service. Calculate the preview as fare times passenger count plus service lines; remove the frontend's 12% tax.

- [ ] **Step 5: Implement create, persisted mode, and payment recovery**

On a new checkout, submit `POST /bookings` once. Set the `booking-create-outcome-unknown` `sessionStorage` marker before dispatch so reload/back in the same tab cannot resubmit an uncertain request. Treat timeout, connection loss, malformed response, and HTTP 5xx after dispatch as unknown; keep the marker and navigate to `/my-bookings?createOutcome=unknown`. A definitive validation/authentication 4xx clears the marker and leaves the corrected draft submit-able. On success, immediately write the returned `bookingId` into the checkout URL before clearing the marker; stop using draft data as authority and show the backend total before payment. Tell the customer with an unknown outcome to verify manually in My Bookings and do not offer automatic retry of that draft. Payment 409 or uncertain transport refetches the booking before any next action; `CONFIRMED` routes to confirmation, `PENDING` permits an explicit payment attempt, and `PAYMENT_FAILED` is terminal. A payment response of `FAILED` follows the terminal failure path without creating another booking.

- [ ] **Step 6: Load confirmation from backend and run the focused tests**

Use `/confirmation/:bookingId`, fetch `GET /bookings/{id}`, and show success only for `CONFIRMED`. Remove generated PNR fallback, ticket-issued, gate, seat, card, QR, wallet, encryption, and certification claims. Run the focused command from Step 2.
Expected: all customer-flow and checkout tests pass, including persisted ID reuse and no mock confirmation.

- [ ] **Step 7: Commit the customer journey slice**

```bash
git add frontend/src/types/bookingFlow.ts frontend/src/hooks/useFlights.ts frontend/src/context/BookingFlowContext.tsx frontend/src/hooks/useBookingFlow.ts frontend/src/components/flight frontend/src/components/service/ServiceCard.tsx frontend/src/components/passenger/PassengerForm.tsx frontend/src/components/booking/PriceSummaryCard.tsx frontend/src/pages/FlightResultsPage.tsx frontend/src/pages/PassengerInfoPage.tsx frontend/src/pages/AdditionalServicesPage.tsx frontend/src/pages/CheckoutPaymentPage.tsx frontend/src/pages/BookingConfirmationPage.tsx frontend/src/App.tsx frontend/src/hooks/useFlights.test.ts frontend/src/pages/PassengerInfoPage.test.tsx frontend/src/pages/AdditionalServicesPage.test.tsx frontend/src/components/booking/PriceSummaryCard.test.tsx frontend/src/pages/CheckoutPaymentPage.test.tsx frontend/src/pages/BookingConfirmationPage.test.tsx
git commit -m "feat: connect customer booking and payment flow"
```

### Task 4: Customer Booking History and Admin Booking List

**Files:**
- Modify: `frontend/src/pages/MyBookingsPage.tsx`
- Modify: `frontend/src/pages/SearchFlightPage.tsx`
- Modify: `frontend/src/pages/admin/AdminBookingsPage.tsx`
- Modify: `frontend/src/components/booking/BookingCard.tsx`
- Modify: `frontend/src/components/booking/BookingDossierModal.tsx`
- Modify: `frontend/src/hooks/useAdminPortal.ts`
- Test: `frontend/src/pages/MyBookingsPage.test.tsx`
- Test: `frontend/src/pages/SearchFlightPage.test.tsx`
- Test: `frontend/src/pages/admin/AdminBookingsPage.test.tsx`

**Interfaces:**
- My Bookings loads `BookingSummary[]` from `GET /bookings/me`; opening a record calls `GET /bookings/{id}` for `BookingDetail`.
- Cancel calls `PATCH /bookings/{id}/cancel` and consumes only `CancelBookingResponse` (`id`, `bookingCode`, `status`); a 409 triggers `GET /bookings/{id}` and renders the authoritative returned status. Refetch on success only if the open detail view needs fields beyond this minimal response.
- Admin list consumes `{ data: AdminBookingListRecord[]; pagination: { total; page; size; totalPages } }` from `GET /bookings`; `page` and `size` are sent to the backend, optional `status` uses only the four backend enum values.
- Admin detail accepts only the selected `AdminBookingListRecord` and renders optional fields when present; it does not call `GET /bookings/{id}`.
- My Bookings displays the unknown-create manual-verification message when `createOutcome=unknown`; starting a deliberate new search clears the `booking-create-outcome-unknown` same-tab marker.

- [ ] **Step 1: Write customer history and admin list tests**

Assert `/me` supplies customer cards, opening a card fetches its ID detail, only `PENDING` offers cancellation, successful cancel updates status from the minimal response, and cancel 409 refetches and displays the returned detail status. Assert My Bookings shows manual-verification guidance for an uncertain create and a deliberate new search clears the same-tab guard. Assert admin requests pages/status from `/bookings`, reads `data` and `{total,page,size,totalPages}`, displays only fields present in its selected record, has no refund/cancel action, and makes no detail request.

Name the focused tests `cancel 409 refetches and renders current booking` and `admin dossier uses available list fields without a detail request`.

- [ ] **Step 2: Run focused tests and confirm they fail**

Run from `frontend/`: `pnpm exec vitest run src/pages/MyBookingsPage.test.tsx src/pages/SearchFlightPage.test.tsx src/pages/admin/AdminBookingsPage.test.tsx`
Expected: FAIL because both pages currently use local mock booking state.

- [ ] **Step 3: Connect customer history, detail, and cancellation**

Load summaries from `/bookings/me`, load details only when opened, show backend-supported statuses, and cancel pending records through the API. Update visible status from the minimal cancel response; refetch detail on success only if the open view needs additional fields. On 409 refetch the record and update the card/modal from the response; show a conflict message only if the refreshed state still needs explanation. Show manual-verification guidance for the unknown-create query state. Clear the session guard only when the customer deliberately submits a new flight search. Remove refund and mock ticket/seat/passenger-contact claims from `BookingCard` and `BookingDossierModal`.

- [ ] **Step 4: Connect the admin paginated list**

Replace `useAdminPortal` booking mocks with API state in `AdminBookingsPage`; preserve its unrelated mock admin flight/fare/service data. Read records from `data` and drive page controls from `pagination.total`, `pagination.page`, `pagination.size`, and `pagination.totalPages`; keep search limited to the loaded page. Render admin detail only from available list-record fields; remove mutation actions and the unsupported `COMPLETED` filter. Run the focused command from Step 2.
Expected: tests pass, customer details use the owner-scoped endpoint, and admin makes list calls only.

- [ ] **Step 5: Run the frontend build and full test suite**

Run from `frontend/`: `pnpm build` and `pnpm exec vitest run`.
Expected: TypeScript/Vite build succeeds and all frontend tests pass.

- [ ] **Step 6: Commit the booking-list slice**

```bash
git add frontend/src/pages/MyBookingsPage.tsx frontend/src/pages/SearchFlightPage.tsx frontend/src/pages/admin/AdminBookingsPage.tsx frontend/src/components/booking/BookingCard.tsx frontend/src/components/booking/BookingDossierModal.tsx frontend/src/hooks/useAdminPortal.ts frontend/src/pages/MyBookingsPage.test.tsx frontend/src/pages/SearchFlightPage.test.tsx frontend/src/pages/admin/AdminBookingsPage.test.tsx
git commit -m "feat: load customer and admin bookings from backend"
```
