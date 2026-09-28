# Airline Booking System - Issues Setup Guide

**Project:** Airline Booking System  
**Timeline:** 3 weeks  
**Team:** 3 members

---

## ISSUE SETUP INSTRUCTIONS

### Option 1: GitHub Issues

1. Go to repository → **Issues** → **New issue**
2. Copy template từ section bên dưới
3. Add labels: `backend`, `frontend`, `api`, `pattern`, `test`, `urgent`
4. Assign to team member
5. Link related issues via `Relates to #X` hoặc `Closes #X`

### Option 2: Project Board (Kanban)

1. Tạo 3 columns cho 3 team members
2. Hoặc tạo columns: `To Do`, `In Progress`, `Review`, `Done`
3. Mỗi issue gắn milestone = tuần làm việc

### Option 3: Task List trong 1 Issue

Tạo 1 issue lớn cho mỗi người, trong đó có checklist cho từng task nhỏ.

---

## MILESTONES

| Milestone | Due Date | Description |
|-----------|----------|-------------|
| Week 1 - Setup & Core | 2026-10-03 | Auth, Flight CRUD, Booking skeleton |
| Week 2 - Business Logic | 2026-10-10 | Payment, State, Strategy, Observer |
| Week 3 - Integration & Polish | 2026-10-17 | Tests, UI polish, Factory Pattern |

---

## ISSUES CHO NGƯỜI 1: AUTH + FLIGHT + FARE

### ISSUE #1: Backend - Auth & Security Setup
```
Title: [Backend] Setup Supabase JWT authentication & SecurityConfig

Labels: backend, auth, security
Assignee: [Người 1]
Milestone: Week 1

Description:
- Setup SupabaseJwtFilter để verify JWT từ Supabase
- Configure SecurityConfig.java:
  - Public endpoints: GET /flights, GET /fares
  - Protected endpoints: tất cả POST/PUT/DELETE
  - Admin-only: Flight/Fare/Service CRUD
- Test JWT validation với mock token

Files to modify:
- config/SecurityConfig.java
- infrastructure/security/SupabaseJwtFilter.java

Acceptance Criteria:
- [ ] JWT token được verify đúng
- [ ] Unauthorized requests trả 401
- [ ] Admin endpoints require ADMIN role
```

---

### ISSUE #2: Backend - Flight Module
```
Title: [Backend] Flight CRUD API

Labels: backend, api, flight
Assignee: [Người 1]
Milestone: Week 1
Depends on: #1

Description:
Implement Flight module theo SRS.md section 3.2:

Entity & Repository:
- Flight.java entity với fields: id, flight_number, origin, destination, 
  departure_time, arrival_time, base_price, available_seats, created_at, updated_at
- FlightRepository.java với search query

Service:
- FlightService.java:
  - searchFlights(origin, destination, date) 
  - getFlightById(id)
  - createFlight(flightDto) - ADMIN
  - updateFlight(id, flightDto) - ADMIN
  - deleteFlight(id) - ADMIN

Controller:
- FlightController.java:
  - GET /api/flights?origin=&destination=&date= - Public
  - GET /api/flights/{id} - Public
  - POST /api/flights - ADMIN
  - PUT /api/flights/{id} - ADMIN
  - DELETE /api/flights/{id} - ADMIN

DTOs:
- FlightRequest.java (cho create/update)
- FlightResponse.java (cho response)
- FlightSearchResponse.java (cho search results với prices)

Files to create:
- domain/entity/Flight.java
- domain/repository/FlightRepository.java
- application/service/FlightService.java
- presentation/controller/FlightController.java
- presentation/dto/request/FlightRequest.java
- presentation/dto/response/FlightResponse.java

Files to modify:
- presentation/dto/response/ApiResponse.java (nếu cần)

Acceptance Criteria:
- [ ] Search flights by origin, destination, date
- [ ] Flight CRUD operations work
- [ ] Validation cho request data
- [ ] Unit tests cho FlightService
```

---

### ISSUE #3: Backend - Fare Class Module
```
Title: [Backend] Fare Class CRUD API

Labels: backend, api, fare
Assignee: [Người 1]
Milestone: Week 1
Depends on: #1

Description:
Implement Fare Class module theo SRS.md section 3.3:

Entity & Repository:
- FareClass.java: id, code, name, price_multiplier, active
- FareClassRepository.java

Service:
- FareService.java:
  - getAllActiveFareClasses()
  - getFareClassById(id)
  - createFareClass(dto) - ADMIN
  - updateFareClass(id, dto) - ADMIN
  - deleteFareClass(id) - ADMIN

Controller:
- FareController.java:
  - GET /api/fares - Public
  - GET /api/fares/{id} - Public
  - POST /api/fares - ADMIN
  - PUT /api/fares/{id} - ADMIN
  - DELETE /api/fares/{id} - ADMIN

Files to create:
- domain/entity/FareClass.java
- domain/repository/FareClassRepository.java
- application/service/FareService.java
- presentation/controller/FareController.java
- presentation/dto/request/FareClassRequest.java
- presentation/dto/response/FareClassResponse.java

Acceptance Criteria:
- [ ] Fare classes có thể query
- [ ] CRUD operations work
- [ ] Seed data: ECONOMY (1.0), PREMIUM (1.5), BUSINESS (2.5)
- [ ] Unit tests
```

---

### ISSUE #4: Frontend - Auth Pages
```
Title: [Frontend] Auth pages (Login, Register)

Labels: frontend, auth
Assignee: [Người 1]
Milestone: Week 1
Depends on: #1

Description:
Implement auth pages sử dụng Supabase Auth:

Pages:
- LoginPage.jsx:
  - Email/password form
  - Call supabase.auth.signInWithPassword()
  - Redirect to /flights on success
  - Show error on failure

- RegisterPage.jsx:
  - Email/password/fullName form
  - Call supabase.auth.signUp() với metadata
  - Show success message / redirect to login

Components:
- AuthContext.jsx:
  - Manage auth state
  - Provide user, session, login(), logout(), register()
  - Subscribe to supabase.auth.onAuthStateChange()

Files to create:
- context/AuthContext.jsx
- pages/auth/LoginPage.jsx
- pages/auth/RegisterPage.jsx
- components/common/Input.jsx (reusable)

Files to modify:
- App.jsx (routing)
- lib/supabase.js (nếu cần config)

Acceptance Criteria:
- [ ] User có thể đăng ký
- [ ] User có thể đăng nhập
- [ ] Auth state persisted across page refresh
- [ ] Protected routes redirect to login
```

---

### ISSUE #5: Frontend - Flight Search & List
```
Title: [Frontend] Flight search and list pages

Labels: frontend, flight
Assignee: [Người 1]
Milestone: Week 1
Depends on: #2, #4

Description:
Implement flight search UI:

Pages:
- FlightSearchPage.jsx:
  - Search form: origin, destination, date
  - Call GET /api/flights
  - Display FlightListPage on results

- FlightListPage.jsx:
  - Display list of FlightCard components
  - Handle loading, empty, error states
  - "Select" button → navigate to booking

Components:
- FlightSearch.jsx:
  - Search form component
  - Date picker (use native <input type="date">)

- FlightCard.jsx:
  - Display: flight number, route, time, price breakdown
  - "Chọn chuyến bay" button

API:
- apiClient.js (axios setup với JWT interceptor)
- flightApi.js:
  - searchFlights(params)
  - getFlightById(id)

Files to create:
- api/apiClient.js
- api/flightApi.js
- pages/flight/FlightSearchPage.jsx
- pages/flight/FlightListPage.jsx
- components/flight/FlightSearch.jsx
- components/flight/FlightCard.jsx

Acceptance Criteria:
- [ ] Search form hoạt động
- [ ] Flight list hiển thị đúng
- [ ] Price breakdown theo fare class
- [ ] Navigate to booking page on select
```

---

## ISSUES CHO NGƯỜI 2: BOOKING + PAYMENT + STATE PATTERN

### ISSUE #6: Backend - Booking Entity & Repository
```
Title: [Backend] Booking entity và Repository

Labels: backend, booking
Assignee: [Người 2]
Milestone: Week 1
Depends on: #1

Description:
Implement Booking domain layer:

Entity:
- Booking.java:
  - id, booking_code, user_id, flight_id, fare_class_id, 
    status, total_price, created_at, updated_at
  - Relationships: flight, fareClass, passengers, bookingServices, payments

- Passenger.java:
  - id, booking_id, full_name, date_of_birth, passport_no, phone
  - Belongs to Booking

- BookingService (join table entity):
  - id, booking_id, service_id, quantity, unit_price

Repository:
- BookingRepository.java:
  - findByUserId(userId)
  - findByUserIdAndStatus(userId, status)
  - findByBookingCode(code)

- PassengerRepository.java

Files to create:
- domain/entity/Booking.java
- domain/entity/Passenger.java
- domain/entity/BookingService.java
- domain/repository/BookingRepository.java
- domain/repository/PassengerRepository.java
- domain/enums/BookingStatus.java

Acceptance Criteria:
- [ ] JPA relationships configured đúng
- [ ] Query methods hoạt động
- [ ] Booking code unique format: BK-XXXXXX
```

---

### ISSUE #7: Backend - BookingService & CRUD
```
Title: [Backend] BookingService và BookingController

Labels: backend, api, booking
Assignee: [Người 2]
Milestone: Week 1
Depends on: #2, #6

Description:
Implement Booking business logic:

BookingService:
- createBooking(userId, bookingRequest):
  - Validate flight exists, seats available
  - Calculate total price (placeholder for now)
  - Create Booking with PENDING status
  - Create Passengers
  - Create BookingServices (if any)
  - Return BookingResponse

- getBookingById(id, userId)
- getUserBookings(userId, status)
- cancelBooking(bookingId, userId) - chỉ PENDING
- cancelBookingAdmin(bookingId, newStatus) - ADMIN

BookingController:
- POST /api/bookings - Create booking
- GET /api/bookings/me - User's bookings
- GET /api/bookings/{id} - Booking detail
- PATCH /api/bookings/{id}/cancel - Cancel (user)
- GET /api/bookings - List all (ADMIN)
- PATCH /api/bookings/{id}/status - Update status (ADMIN)

DTOs:
- BookingRequest.java (với nested passengers, services)
- BookingResponse.java (với nested flight, fareClass, passengers, services, priceBreakdown)

Files to create:
- application/service/BookingService.java
- presentation/controller/BookingController.java
- presentation/dto/request/BookingRequest.java
- presentation/dto/response/BookingResponse.java

Acceptance Criteria:
- [ ] Create booking with passengers
- [ ] View user's bookings
- [ ] Cancel booking (chỉ PENDING)
- [ ] Admin manage bookings
```

---

### ISSUE #8: Backend - State Pattern Implementation
```
Title: [Backend] Booking State Pattern

Labels: backend, pattern, state
Assignee: [Người 2]
Milestone: Week 2
Depends on: #7

Description:
Implement State Pattern cho Booking lifecycle theo BR-003:

State Interface:
- BookingState.java:
  - confirm(BookingStateContext)
  - cancel(BookingStateContext)
  - markPaymentFailed(BookingStateContext)
  - getStatus() → BookingStatus

Concrete States:
- PendingState.java:
  - confirm() → chuyển sang ConfirmedState
  - cancel() → chuyển sang CancelledState
  - markPaymentFailed() → chuyển sang PaymentFailedState

- ConfirmedState.java:
  - Chỉ có cancel() → CancelledState (nếu policy cho phép)
  - Các transition khác throw IllegalStateException

- CancelledState.java:
  - Terminal state - không có transition hợp lệ

- PaymentFailedState.java:
  - confirm() → ConfirmedState (retry payment)
  - cancel() → CancelledState

BookingStateContext:
- Hold current state
- Delegates to current state
- Triggers notifications on state change (sẽ integrate sau)

Files to create:
- pattern/state/BookingState.java
- pattern/state/BookingStateContext.java
- pattern/state/PendingState.java
- pattern/state/ConfirmedState.java
- pattern/state/CancelledState.java
- pattern/state/PaymentFailedState.java

Files to modify:
- BookingService.java (use BookingStateContext)

Acceptance Criteria:
- [ ] Invalid state transitions rejected
- [ ] CANCELLED is terminal
- [ ] State change triggers appropriate actions
- [ ] Unit tests cho state transitions
```

---

### ISSUE #9: Backend - Payment Module
```
Title: [Backend] Payment Service và Mock Payment Gateway

Labels: backend, payment
Assignee: [Người 2]
Milestone: Week 2
Depends on: #7, #8

Description:
Implement Payment module theo BR-004:

Entity:
- Payment.java:
  - id, booking_id, amount, payment_method, status, transaction_ref, paid_at

Repository:
- PaymentRepository.java

Service:
- PaymentService.java:
  - processPayment(bookingId, paymentMethod):
    - Call MockPaymentGateway
    - Create Payment record
    - Update Booking status via BookingStateContext
      - SUCCESS → CONFIRMED
      - FAILED → PAYMENT_FAILED
    - Return PaymentResponse

- MockPaymentGateway:
  - Simulate payment processing
  - 80% success, 20% fail (random)
  - Return transaction_ref on success

Controller:
- PaymentController.java:
  - POST /api/payments

DTOs:
- PaymentRequest.java
- PaymentResponse.java

Files to create:
- domain/entity/Payment.java
- domain/repository/PaymentRepository.java
- domain/enums/PaymentMethod.java
- domain/enums/PaymentStatus.java
- application/service/PaymentService.java
- infrastructure/external/MockPaymentGateway.java
- presentation/controller/PaymentController.java
- presentation/dto/request/PaymentRequest.java
- presentation/dto/response/PaymentResponse.java

Acceptance Criteria:
- [ ] Payment success → Booking CONFIRMED
- [ ] Payment failed → Booking PAYMENT_FAILED
- [ ] Transaction ref generated
- [ ] Unit tests
```

---

### ISSUE #10: Frontend - Booking Flow Pages
```
Title: [Frontend] Booking flow pages

Labels: frontend, booking
Assignee: [Người 2]
Milestone: Week 2
Depends on: #5, #7

Description:
Implement booking flow UI:

Pages:
- BookingPage.jsx (/booking/:flightId):
  - Show selected flight info
  - Fare class selector (Economy/Premium/Business)
  - Continue to PassengerInfoPage

- PassengerInfoPage.jsx (/booking/:flightId/passengers):
  - Dynamic passenger form (1-9 passengers)
  - Each passenger: fullName, dateOfBirth, passportNo, phone
  - Add/remove passenger button

- ServiceSelector.jsx (component hoặc page):
  - Show available services: Baggage, Meal, Seat, Priority Boarding
  - Quantity selector

- BookingSummary.jsx:
  - Price breakdown: base fare, services total, total
  - Confirm booking button

Components:
- FareClassSelector.jsx
- PassengerForm.jsx
- BookingSummary.jsx
- BookingStatus.jsx (hiển thị status badge)

API:
- bookingApi.js:
  - createBooking(data)
  - getMyBookings()
  - getBookingById(id)
  - cancelBooking(id)

Files to create:
- api/bookingApi.js
- pages/booking/BookingPage.jsx
- pages/booking/PassengerInfoPage.jsx
- components/booking/FareClassSelector.jsx
- components/booking/PassengerForm.jsx
- components/booking/BookingSummary.jsx
- components/booking/BookingStatus.jsx

Acceptance Criteria:
- [ ] Multi-step booking wizard
- [ ] Passenger form validation
- [ ] Price calculation displayed
- [ ] Create booking call API
```

---

### ISSUE #11: Frontend - Payment & Booking History
```
Title: [Frontend] Payment page và My Bookings

Labels: frontend, payment
Assignee: [Người 2]
Milestone: Week 2
Depends on: #9, #10

Description:
Implement payment UI và booking history:

Pages:
- PaymentPage.jsx (/booking/:flightId/payment):
  - Show booking summary
  - Payment method selector (Credit Card, Bank Transfer, Mock)
  - Pay button
  - Handle success/failure response
  - Navigate to confirmation or retry

- BookingConfirmationPage.jsx:
  - Success message với booking code
  - Booking details
  - "Tiếp tục đặt vé" button

- MyBookingsPage.jsx (/my-bookings):
  - List of user's bookings
  - Filter by status
  - Click to view detail

- BookingDetailPage.jsx (/my-bookings/:id):
  - Full booking details
  - Status badge
  - Cancel button (if PENDING)
  - Payment info

Components:
- PaymentForm.jsx
- PaymentConfirmation.jsx
- BookingCard.jsx (trong list)

API:
- paymentApi.js:
  - createPayment(data)

Files to create:
- api/paymentApi.js
- pages/booking/PaymentPage.jsx
- pages/booking/BookingConfirmationPage.jsx
- pages/user/MyBookingsPage.jsx
- pages/user/BookingDetailPage.jsx
- components/payment/PaymentForm.jsx
- components/payment/PaymentConfirmation.jsx
- components/booking/BookingCard.jsx

Acceptance Criteria:
- [ ] Payment form submission
- [ ] Success/failure handling
- [ ] Booking history viewable
- [ ] Cancel booking works
```

---

## ISSUES CHO NGƯỜI 3: SERVICE + PRICING + NOTIFICATION

### ISSUE #12: Backend - Additional Service CRUD
```
Title: [Backend] Additional Service CRUD API

Labels: backend, api, service
Assignee: [Người 3]
Milestone: Week 1
Depends on: #1

Description:
Implement Service module theo SRS.md section 3.5:

Entity & Repository:
- AdditionalService.java:
  - id, name, type (BAGGAGE, MEAL, SEAT, PRIORITY_BOARDING), price, active
- ServiceRepository.java

Service:
- AdditionalServiceService.java:
  - getAllActiveServices()
  - getServiceById(id)
  - createService(dto) - ADMIN
  - updateService(id, dto) - ADMIN
  - deleteService(id) - ADMIN

Controller:
- ServiceController.java:
  - GET /api/services - Public
  - GET /api/services/{id} - Public
  - POST /api/services - ADMIN
  - PUT /api/services/{id} - ADMIN
  - DELETE /api/services/{id} - ADMIN

DTOs:
- ServiceRequest.java
- ServiceResponse.java

Files to create:
- domain/entity/AdditionalService.java
- domain/repository/ServiceRepository.java
- domain/enums/ServiceType.java
- application/service/AdditionalServiceService.java
- presentation/controller/ServiceController.java
- presentation/dto/request/ServiceRequest.java
- presentation/dto/response/ServiceResponse.java

Acceptance Criteria:
- [ ] Service CRUD operations
- [ ] Seed data: Baggage, Meal, Seat, Priority Boarding
- [ ] Unit tests
```

---

### ISSUE #13: Backend - Strategy Pattern cho Pricing
```
Title: [Backend] Pricing Strategy Pattern

Labels: backend, pattern, strategy
Assignee: [Người 3]
Milestone: Week 2
Depends on: #3, #7

Description:
Implement Strategy Pattern cho pricing theo BR-002:

Pricing Strategy Interface:
- PricingStrategy.java:
  - calculatePrice(basePrice, passengerCount) → Money

Concrete Strategies:
- EconomyPricingStrategy.java:
  - multiplier = 1.0

- PremiumPricingStrategy.java:
  - multiplier = 1.5

- BusinessPricingStrategy.java:
  - multiplier = 2.5

PricingService:
- getStrategy(fareClassCode) → PricingStrategy
- calculateTicketPrice(flight, fareClass, passengerCount) → Money
- calculateTotalPrice(flight, fareClass, passengers, services) → Money:
  - ticketPrice = basePrice × multiplier × passengerCount
  - servicesTotal = Σ(service.unitPrice × quantity)
  - total = ticketPrice + servicesTotal

Files to create:
- pattern/strategy/PricingStrategy.java
- pattern/strategy/EconomyPricingStrategy.java
- pattern/strategy/PremiumPricingStrategy.java
- pattern/strategy/BusinessPricingStrategy.java
- application/service/PricingService.java

Files to modify:
- BookingService.java (use PricingService instead of manual calculation)

Acceptance Criteria:
- [ ] Strategy được chọn đúng theo fare class
- [ ] Formula đúng: basePrice × multiplier × passengers + services
- [ ] Unit tests cho từng strategy
- [ ] Integration với BookingService
```

---

### ISSUE #14: Backend - Observer Pattern cho Notification
```
Title: [Backend] Observer Pattern cho Notifications

Labels: backend, pattern, observer
Assignee: [Người 3]
Milestone: Week 2
Depends on: #8, #9

Description:
Implement Observer Pattern cho booking notifications theo BR-005:

Observer Interface:
- BookingObserver.java:
  - onBookingStateChange(booking, oldStatus, newStatus, message)

Concrete Observers (MVP - chỉ In-app):
- InAppNotificationObserver.java:
  - Save notification to database
  - Create Notification record cho user

Subject:
- BookingSubject.java:
  - attach(observer)
  - detach(observer)
  - notifyObservers(booking, oldStatus, newStatus, message)

Notification Entity & Repository:
- Notification.java:
  - id, user_id, booking_id, type, message, is_read, created_at
- NotificationRepository.java

NotificationService:
- NotificationService.java:
  - createNotification(userId, bookingId, type, message)
  - getUserNotifications(userId, isRead)
  - markAsRead(notificationId)

Controller:
- NotificationController.java:
  - GET /api/notifications - User's notifications
  - PATCH /api/notifications/{id}/read

Files to create:
- pattern/observer/BookingObserver.java
- pattern/observer/BookingSubject.java
- pattern/observer/InAppNotificationObserver.java
- domain/entity/Notification.java
- domain/repository/NotificationRepository.java
- domain/enums/NotificationType.java
- application/service/NotificationService.java
- presentation/controller/NotificationController.java
- presentation/dto/response/NotificationResponse.java

Files to modify:
- BookingService.java (trigger notifications on state change)
- BookingStateContext.java (integrate with BookingSubject)

Acceptance Criteria:
- [ ] Notification created on booking state change
- [ ] User có thể xem notifications
- [ ] Mark as read works
- [ ] Observer pattern hoạt động
- [ ] Unit tests
```

---

### ISSUE #15: Backend - Factory Pattern (Bonus)
```
Title: [Backend] Factory Pattern cho Ticket Generation

Labels: backend, pattern, factory
Assignee: [Người 3]
Milestone: Week 3
Depends on: #8, #9

Description:
Implement Factory Pattern cho ticket generation:

Ticket Model:
- Ticket.java (base):
  - bookingRef, passenger, flight, issuedAt

- ETicket.java extends Ticket:
  - barcode, pdfUrl, qrCode

- BoardingPass.java extends Ticket:
  - gate, seat, boardingTime, boardingGroup

TicketFactory:
- TicketFactory.java:
  - createTicket(booking) → Ticket
  - createETicket(booking) → ETicket
  - generateBarcode() → String
  - generateQRCode(ticket) → String

Integration:
- Gọi TicketFactory khi Booking chuyển sang CONFIRMED
- Lưu ticket info vào booking hoặc tạo separate table

Files to create:
- domain/model/Ticket.java
- domain/model/ETicket.java
- domain/model/BoardingPass.java
- pattern/factory/TicketFactory.java
- application/service/TicketService.java

Acceptance Criteria:
- [ ] Factory pattern implemented
- [ ] ETicket với barcode generated
- [ ] BoardingPass với gate assignment
- [ ] Unit tests
```

---

### ISSUE #16: Frontend - Service Selector
```
Title: [Frontend] Service selector component

Labels: frontend, service
Assignee: [Người 3]
Milestone: Week 2
Depends on: #10, #12

Description:
Implement service selector UI:

Component:
- ServiceSelector.jsx:
  - List available services với checkboxes
  - Service info: name, type icon, price
  - Quantity selector (1-10)
  - Real-time price calculation
  - Show running total

API:
- serviceApi.js:
  - getServices()

Files to create:
- api/serviceApi.js
- components/booking/ServiceSelector.jsx
- hooks/useServices.js (custom hook)

Acceptance Criteria:
- [ ] Services displayed correctly
- [ ] Quantity selection works
- [ ] Price updates in real-time
- [ ] Total synced với backend calculation
```

---

### ISSUE #17: Frontend - Notifications UI
```
Title: [Frontend] Notifications display

Labels: frontend, notification
Assignee: [Người 3]
Milestone: Week 2
Depends on: #14

Description:
Implement notifications UI:

Components:
- NotificationContext.jsx:
  - Fetch user notifications
  - Provide unread count
  - Refresh on new notifications

- Toast.jsx:
  - Temporary notification popup
  - Auto-dismiss after 5s
  - Show on booking state changes

- NotificationDropdown.jsx:
  - Bell icon với unread badge
  - Dropdown list of notifications
  - Mark as read on click

- NotificationList.jsx:
  - Full notification history page
  - Filter: all, unread
  - Pagination

Layout:
- Navbar.jsx (update):
  - Include NotificationDropdown

API:
- notificationApi.js:
  - getNotifications(params)
  - markAsRead(id)

Files to create:
- api/notificationApi.js
- context/NotificationContext.jsx
- components/common/Toast.jsx
- components/common/NotificationDropdown.jsx
- pages/user/NotificationListPage.jsx
- hooks/useNotifications.js

Files to modify:
- components/layout/Navbar.jsx

Acceptance Criteria:
- [ ] Unread badge on bell icon
- [ ] Dropdown shows recent notifications
- [ ] Toast appears on booking change
- [ ] Full list page viewable
- [ ] Mark as read works
```

---

### ISSUE #18: Frontend - Admin Pages
```
Title: [Frontend] Admin management pages

Labels: frontend, admin
Assignee: [Người 3]
Milestone: Week 3
Depends on: #2, #3, #12

Description:
Implement admin management UI:

Pages:
- AdminDashboard.jsx (/admin):
  - Overview stats
  - Quick links to management sections

- AdminFlightManagement.jsx (/admin/flights):
  - Flight list với CRUD actions
  - Create/Edit modal form
  - Delete confirmation

- AdminFareManagement.jsx (/admin/fares):
  - Fare class list
  - CRUD operations

- AdminServiceManagement.jsx (/admin/services):
  - Service list
  - CRUD operations

- AdminBookingManagement.jsx (/admin/bookings):
  - All bookings list
  - Filter by status
  - View booking details
  - Update booking status

Components:
- AdminTable.jsx (reusable table)
- AdminFormModal.jsx (reusable form modal)
- StatusBadge.jsx

Files to create:
- pages/admin/AdminDashboard.jsx
- pages/admin/AdminFlightManagement.jsx
- pages/admin/AdminFareManagement.jsx
- pages/admin/AdminServiceManagement.jsx
- pages/admin/AdminBookingManagement.jsx
- components/admin/AdminTable.jsx
- components/admin/AdminFormModal.jsx
- components/common/StatusBadge.jsx

Files to modify:
- App.jsx (admin routes)

Acceptance Criteria:
- [ ] Admin can manage flights
- [ ] Admin can manage fare classes
- [ ] Admin can manage services
- [ ] Admin can view/update bookings
- [ ] Role-based route protection
```

---

## SUMMARY TABLE

| # | Issue | Labels | Assignee | Milestone | Depends on |
|---|-------|--------|----------|-----------|------------|
| 1 | Backend Auth & Security | backend, auth | Người 1 | Week 1 | - |
| 2 | Backend Flight CRUD | backend, api | Người 1 | Week 1 | 1 |
| 3 | Backend Fare CRUD | backend, api | Người 1 | Week 1 | 1 |
| 4 | Frontend Auth Pages | frontend, auth | Người 1 | Week 1 | 1 |
| 5 | Frontend Flight UI | frontend, flight | Người 1 | Week 1 | 2, 4 |
| 6 | Backend Booking Entity | backend, booking | Người 2 | Week 1 | 1 |
| 7 | Backend Booking Service | backend, api, booking | Người 2 | Week 1 | 2, 6 |
| 8 | Backend State Pattern | backend, pattern, state | Người 2 | Week 2 | 7 |
| 9 | Backend Payment | backend, payment | Người 2 | Week 2 | 7, 8 |
| 10 | Frontend Booking Flow | frontend, booking | Người 2 | Week 2 | 5, 7 |
| 11 | Frontend Payment UI | frontend, payment | Người 2 | Week 2 | 9, 10 |
| 12 | Backend Service CRUD | backend, api, service | Người 3 | Week 1 | 1 |
| 13 | Backend Strategy Pattern | backend, pattern, strategy | Người 3 | Week 2 | 3, 7 |
| 14 | Backend Observer Pattern | backend, pattern, observer | Người 3 | Week 2 | 8, 9 |
| 15 | Backend Factory Pattern | backend, pattern, factory | Người 3 | Week 3 | 8, 9 |
| 16 | Frontend Service Selector | frontend, service | Người 3 | Week 2 | 10, 12 |
| 17 | Frontend Notifications | frontend, notification | Người 3 | Week 2 | 14 |
| 18 | Frontend Admin Pages | frontend, admin | Người 3 | Week 3 | 2, 3, 12 |

---

## LABELS SUGGESTED

```
Type:
- backend
- frontend
- both

Module:
- auth
- flight
- fare
- booking
- payment
- service
- notification

Pattern:
- strategy
- state
- observer
- factory

Quality:
- test
- bug
- documentation

Priority:
- urgent
- high
- medium
- low
```

---

## GITHUB ISSUE TEMPLATE (Markdown)

```markdown
## Mô tả

[Mô tả ngắn gọn về công việc]

## Acceptance Criteria

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Files

**To create:**
- `path/to/file1.java`
- `path/to/file2.jsx`

**To modify:**
- `path/to/existing.java`

## Dependencies

- Related to #X
- Depends on #Y

## Notes

[Thêm ghi chú nếu cần]
```

---

## GITHUB MILESTONE TEMPLATE

```
## Mục tiêu

[Mục tiêu của tuần này]

## Công việc cần làm

- [ ] [Backend] Auth & Security Setup
- [ ] [Backend] Flight CRUD API
- [ ] ...

## Definition of Done

- Tất cả issues trong milestone được closed
- Code review passed
- Tests pass
- Documentation updated
```
