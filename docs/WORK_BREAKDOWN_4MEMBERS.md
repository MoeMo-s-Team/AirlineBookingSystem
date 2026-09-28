# Work Breakdown - 4 Members

**Project:** Airline Booking System  
**Date:** 2026-09-26  
**Status:** Ready to start

---

## TEAM ASSIGNMENTS

| Member       | Modules                   | Backend                              | Frontend              |
| ------------ | ------------------------- | ------------------------------------ | --------------------- |
| **Hieu**     | Auth + Flight             | JWT, Flight CRUD                     | Flight pages          |
| **My**       | Fare + Service            | Fare/Service CRUD                    | Service selector      |
| **Hien**     | Booking + Payment + State | Booking flow, Payment, State Pattern | Booking/Payment pages |
| **Thuy Anh** | Frontend All + Observer   | Notification infrastructure          | All UI components     |

---

## DETAILED TASKS

### MEMBER 1: Hieu - Auth + Flight

#### Backend

**Repository (new):**

```
backend/src/main/java/com/airline/domain/repository/
├── FlightRepository.java      # Flight search queries
```

**Service (new):**

```
backend/src/main/java/com/airline/application/service/
├── FlightService.java         # Flight business logic
```

**Controller (new):**

```
backend/src/main/java/com/airline/presentation/controller/
├── FlightController.java     # Flight endpoints
```

**DTOs (new):**

```
backend/src/main/java/com/airline/presentation/dto/request/
├── FlightRequest.java

backend/src/main/java/com/airline/presentation/dto/response/
├── FlightResponse.java
├── FlightSearchResponse.java
```

#### Frontend

```
frontend/src/pages/flight/
├── FlightSearchPage.tsx
├── FlightListPage.tsx
├── FlightDetailPage.tsx

frontend/src/components/flight/
├── FlightSearch.tsx
├── FlightCard.tsx
├── FlightList.tsx
├── FlightFilter.tsx

frontend/src/api/
├── flightApi.ts
```

#### Tasks Checklist

- [ ] `FlightRepository.java` với search methods
- [ ] `FlightService.java`: searchFlights, getById, create, update, delete
- [ ] `FlightController.java`: GET/POST/PUT/DELETE /api/flights
- [ ] `FlightRequest.java`, `FlightResponse.java` DTOs
- [ ] `FlightSearchPage.tsx` - Search form
- [ ] `FlightListPage.tsx` - Results display
- [ ] `FlightCard.tsx` - Card component
- [ ] `flightApi.ts` - API client

---

### MEMBER 2: My - Fare + Service

#### Backend

**Repository (new):**

```
backend/src/main/java/com/airline/domain/repository/
├── FareClassRepository.java
├── ServiceRepository.java
```

**Service (new):**

```
backend/src/main/java/com/airline/application/service/
├── FareService.java
├── AdditionalServiceService.java
```

**Controller (new):**

```
backend/src/main/java/com/airline/presentation/controller/
├── FareController.java
├── ServiceController.java
```

**DTOs (new):**

```
backend/src/main/java/com/airline/presentation/dto/request/
├── FareClassRequest.java
├── ServiceRequest.java

backend/src/main/java/com/airline/presentation/dto/response/
├── FareClassResponse.java
├── ServiceResponse.java
```

#### Frontend

```
frontend/src/components/booking/
├── FareClassSelector.tsx      # Fare class selection component

frontend/src/api/
├── fareApi.ts
├── serviceApi.ts
```

#### Tasks Checklist

- [ ] `FareClassRepository.java`
- [ ] `ServiceRepository.java`
- [ ] `FareService.java`: CRUD + getActiveFares
- [ ] `AdditionalServiceService.java`: CRUD + getActiveServices
- [ ] `FareController.java`: GET/POST/PUT/DELETE /api/fares
- [ ] `ServiceController.java`: GET/POST/PUT/DELETE /api/services
- [ ] DTOs for Fare and Service
- [ ] `FareClassSelector.tsx` component
- [ ] `fareApi.ts`, `serviceApi.ts`

---

### MEMBER 3: Hien - Booking + Payment + State Pattern

#### Backend

**Repository (new):**

```
backend/src/main/java/com/airline/domain/repository/
├── BookingRepository.java
├── PassengerRepository.java
├── PaymentRepository.java
```

**Service (new):**

```
backend/src/main/java/com/airline/application/service/
├── BookingService.java
├── PaymentService.java
```

**Controller (new):**

```
backend/src/main/java/com/airline/presentation/controller/
├── BookingController.java
├── PaymentController.java
```

**Pattern (new):**

```
backend/src/main/java/com/airline/pattern/state/
├── BookingState.java
├── BookingStateContext.java
├── PendingState.java
├── ConfirmedState.java
├── CancelledState.java
└── PaymentFailedState.java

backend/src/main/java/com/airline/infrastructure/external/
└── MockPaymentGateway.java
```

**DTOs (new):**

```
backend/src/main/java/com/airline/presentation/dto/request/
├── BookingRequest.java
├── PassengerRequest.java
├── PaymentRequest.java

backend/src/main/java/com/airline/presentation/dto/response/
├── BookingResponse.java
├── BookingDetailResponse.java
├── PaymentResponse.java
```

#### Frontend

```
frontend/src/pages/booking/
├── BookingPage.tsx           # Main booking page
├── PassengerInfoPage.tsx     # Passenger form
├── PaymentPage.tsx           # Payment form
├── BookingConfirmationPage.tsx

frontend/src/pages/user/
├── MyBookingsPage.tsx
├── BookingDetailPage.tsx

frontend/src/components/booking/
├── PassengerForm.tsx
├── BookingSummary.tsx
├── BookingStatus.tsx
├── BookingCard.tsx

frontend/src/components/payment/
├── PaymentForm.tsx
├── PaymentConfirmation.tsx

frontend/src/api/
├── bookingApi.ts
├── paymentApi.ts
```

#### Tasks Checklist

- [ ] `BookingRepository.java`, `PassengerRepository.java`, `PaymentRepository.java`
- [ ] State Pattern: `BookingState`, `BookingStateContext`, all states
- [ ] `BookingService.java`: create, get, cancel, getUserBookings
- [ ] `BookingController.java`: POST/GET/PATCH /api/bookings
- [ ] `PaymentService.java` + `MockPaymentGateway.java`
- [ ] `PaymentController.java`: POST /api/payments
- [ ] DTOs: BookingRequest, BookingResponse, PaymentRequest, PaymentResponse
- [ ] Frontend booking pages
- [ ] Frontend payment pages
- [ ] `bookingApi.ts`, `paymentApi.ts`

---

### MEMBER 4: Thuy Anh - Frontend All + Observer

#### Backend

**Repository (new):**

```
backend/src/main/java/com/airline/domain/repository/
├── NotificationRepository.java
├── ProfileRepository.java
```

**Pattern (new):**

```
backend/src/main/java/com/airline/pattern/observer/
├── BookingObserver.java
├── BookingSubject.java
├── InAppNotificationObserver.java
```

**Service (new):**

```
backend/src/main/java/com/airline/application/service/
├── NotificationService.java
```

**Controller (new):**

```
backend/src/main/java/com/airline/presentation/controller/
├── NotificationController.java
├── ProfileController.java      # GET /api/profile/me
```

**DTOs (new):**

```
backend/src/main/java/com/airline/presentation/dto/response/
├── NotificationResponse.java
├── ProfileResponse.java
```

#### Frontend

```
frontend/src/pages/auth/
├── LoginPage.tsx
├── RegisterPage.tsx

frontend/src/pages/user/
├── UserDashboard.tsx
├── NotificationListPage.tsx

frontend/src/pages/admin/
├── AdminDashboard.tsx
├── AdminFlightManagement.tsx
├── AdminBookingManagement.tsx

frontend/src/components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── LoadingSpinner.tsx
│   ├── Toast.tsx
│   └── StatusBadge.tsx
│
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
│
├── booking/
│   └── ServiceSelector.tsx     # Integrates with Member 2's backend
│
├── notification/
│   ├── NotificationDropdown.tsx
│   └── NotificationItem.tsx

frontend/src/context/
├── BookingContext.tsx
├── NotificationContext.tsx

frontend/src/hooks/
├── useBooking.ts
├── useNotification.ts
├── useFlightSearch.ts
```

#### Tasks Checklist

- [ ] `ProfileRepository.java`
- [ ] `NotificationRepository.java`
- [ ] Observer Pattern: `BookingObserver`, `BookingSubject`, `InAppNotificationObserver`
- [ ] `NotificationService.java`
- [ ] `NotificationController.java`: GET /api/notifications, PATCH /read
- [ ] `ProfileController.java`: GET /api/profile/me
- [ ] DTOs: NotificationResponse, ProfileResponse
- [ ] `LoginPage.tsx`, `RegisterPage.tsx` (AuthContext exists)
- [ ] `Navbar.tsx` với auth links + notification bell
- [ ] `NotificationDropdown.tsx` với unread badge
- [ ] `Toast.tsx` cho notifications
- [ ] `NotificationContext.tsx`
- [ ] Common components (Button, Input, Modal, etc.)
- [ ] Admin pages skeleton
- [ ] `BookingContext.tsx`

---

## FILES ALREADY EXIST (DON'T RECREATE)

### Backend

```
✅ AirlineApplication.java
✅ SecurityConfig.java
✅ SupabaseProperties.java
✅ SupabaseJwtFilter.java
✅ CorsConfig.java
✅ GlobalExceptionHandler.java
✅ ResourceNotFoundException.java
✅ ApiResponse.java
✅ All domain entities (Profile, Flight, FareClass, Booking, Passenger, Payment, AdditionalService, BookingServiceItem, Notification, Role)
✅ All enums (BookingStatus, PaymentStatus, ServiceType)
```

### Frontend

```
✅ supabase.ts
✅ apiClient.ts
✅ AuthContext.tsx
✅ HomePage.tsx
✅ Header.tsx
✅ App.tsx
✅ main.tsx
✅ index.css
```

---

## DEPENDENCIES BETWEEN MEMBERS

```
Hieu (Flight)
    │
    └── Flight ──► Hien (Booking cần flightId)
    └── Flight ──► Member 4 (Admin cần view flights)

My (Fare, Service)
    │
    └── Fare ──► Hien (Pricing cần fare_multiplier)
    └── Service ──► Hien (Booking cần services)

Hien (Booking, Payment)
    │
    └── Booking ──► Member 4 (Notification khi state change)
    └── Booking ──► Hieu (Bookings thuộc flights)

Thuy Anh (Frontend, Observer)
    │
    └── Notification ──► Hien (Observer gọi khi booking thay đổi)
    └── Frontend ──► All (API calls)
```

---

## COMMUNICATION POINTS

### Interface contracts cần thống nhất trước:

1. **BookingRequest DTO** - Cấu trúc khi tạo booking
2. **BookingResponse DTO** - Response trả về
3. **PriceBreakdown** - Format price breakdown
4. **Notification format** - Khi nào gửi notification

### Suggested response format:

```java
// BookingResponse.java
public class BookingResponse {
    Long id;
    String bookingCode;
    String status;
    FlightInfo flight;
    FareInfo fareClass;
    List<PassengerInfo> passengers;
    List<ServiceInfo> services;
    PriceBreakdown priceBreakdown;
    BigDecimal totalPrice;
    LocalDateTime createdAt;
}
```

---

## GIT BRANCH STRATEGY

```
main
 ├── feature/hieu/flight-backend
 ├── feature/hieu/flight-frontend
 ├── feature/my/fare-service-backend
 ├── feature/my/fare-service-frontend
 ├── feature/hien/booking-backend
 ├── feature/hien/booking-frontend
 ├── feature/thuyanh/frontend-auth
 ├── feature/thuyanh/notification-backend
 └── feature/thuyanh/frontend-ui
```

**Merging order:**

1. Feature branches → `develop` (hoặc merge trực tiếp vào main nếu đơn giản)
2. Resolve conflicts at boundaries (Booking → Flight/Fare)

---

## QUESTIONS FOR TEAM

1. Ai sẽ làm Design Patterns (Strategy, Factory)? Gợi ý: Hien handle State + Observer, My handle Strategy, Factory bonus nếu có thời gian
2. Database setup: Ai sẽ tạo DDL script hoặc chạy `ddl-auto: update`?
3. Test data: Ai sẽ seed data cho development?

---

## EMERGENCY CONTACTS

| Issue                  | Contact        |
| ---------------------- | -------------- |
| JWT/Auth problems      | Hieu           |
| Database schema        | Hieu hoặc Hien |
| API contract questions | Hien           |
| Frontend integration   | Member 4       |
| Supabase setup         | Hien           |

---

## CHECKPOINTS

| Date         | Milestone                        | Owner    |
| ------------ | -------------------------------- | -------- |
| Week 1 Day 3 | Flight CRUD working + UI         | Hieu     |
| Week 1 Day 3 | Fare/Service CRUD + UI           | My       |
| Week 1 Day 5 | Booking skeleton + State Pattern | Hien     |
| Week 1 Day 5 | Auth pages + Observer            | Thuy Anh |
| Week 2       | Full integration                 | All      |
| Week 3       | Polish + Tests                   | All      |
