# Airline Booking System - System Architecture Document

> **Document Version:** 1.0  
> **Last Updated:** 2026-09-26  
> **Project:** Airline Booking System with Design Patterns

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Full Project Structure](#2-full-project-structure)
3. [Backend Architecture (Spring Boot)](#3-backend-architecture-spring-boot)
4. [Frontend Architecture (React)](#4-frontend-architecture-react)
5. [Design Patterns Implementation](#5-design-patterns-implementation)
6. [Database Schema](#6-database-schema)
7. [API Flow Diagrams](#7-api-flow-diagrams)
8. [Components Mapping](#8-components-mapping)
9. [Getting Started](#9-getting-started)

---

## 1. System Overview

### 1.1 System Type
- **Type:** Full-stack Web Application (Booking System)
- **Architecture:** Layered Architecture with Design Patterns
- **Domain:** Airline Ticket Booking System

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + Vite + TailwindCSS | User Interface |
| **Backend** | Spring Boot 3.x + Java 21 | REST API |
| **Database** | Supabase PostgreSQL | Data Persistence |
| **Security** | Supabase Auth + JWT | Authentication |
| **Testing** | JUnit 5 + Mockito | Unit Testing |

### 1.3 System Goals
- ✅ Allow users to search and book flights
- ✅ Support multiple fare classes (Economy, Premium, Business)
- ✅ Manage booking lifecycle with state transitions
- ✅ Send notifications on booking status changes
- ✅ Demonstrate 4 design patterns: Strategy, State, Observer, Factory

---

## 2. Full Project Structure

```
airline-booking-system/
│
├── 📁 backend/                    # Spring Boot API
├── 📁 frontend/                   # React SPA
├── 📁 docs/                       # Design Documents
│   ├── System_Architecture.md     # This file
│   ├── Database_Design.md
│   ├── SSR.md
│   └── UI_Design.md
├── 📁 docker-compose.yml          # Container orchestration
├── 📁 README.md
└── 📁 .gitignore
```

---

## 3. Backend Architecture (Spring Boot)

### 3.1 Directory Structure

```
backend/
├── src/main/java/com/airline/
│   │
│   ├── config/                    # Configuration Classes
│   │   ├── SecurityConfig.java
│   │   ├── SupabaseProperties.java
│   │   ├── WebConfig.java
│   │   └── CorsConfig.java
│   │
│   ├── presentation/              # REST Controllers
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── FlightController.java
│   │   │   ├── BookingController.java
│   │   │   ├── PaymentController.java
│   │   │   ├── PassengerController.java
│   │   │   └── NotificationController.java
│   │   │
│   │   ├── dto/                  # Data Transfer Objects
│   │   │   ├── request/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── BookingRequest.java
│   │   │   │   ├── PaymentRequest.java
│   │   │   │   └── PassengerRequest.java
│   │   │   │
│   │   │   └── response/
│   │   │       ├── AuthResponse.java
│   │   │       ├── BookingResponse.java
│   │   │       ├── FlightResponse.java
│   │   │       ├── PaymentResponse.java
│   │   │       └── ApiResponse.java
│   │   │
│   │   └── exception/             # Exception Handling
│   │       ├── GlobalExceptionHandler.java
│   │       ├── ResourceNotFoundException.java
│   │       ├── BookingException.java
│   │       └── PaymentException.java
│   │
│   ├── application/               # Business Logic Layer
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── FlightService.java
│   │   │   ├── BookingService.java
│   │   │   ├── PaymentService.java
│   │   │   ├── PassengerService.java
│   │   │   ├── NotificationService.java
│   │   │   ├── FareService.java
│   │   │   └── PricingService.java
│   │   │
│   │   └── mapper/                # DTO ↔ Entity Mapping
│   │       ├── BookingMapper.java
│   │       ├── FlightMapper.java
│   │       └── PassengerMapper.java
│   │
│   ├── domain/                    # Domain Layer
│   │   ├── entity/
│   │   │   ├── Profile.java      # Synced from Supabase Auth
│   │   │   ├── Flight.java
│   │   │   ├── Airport.java
│   │   │   ├── Booking.java
│   │   │   ├── Passenger.java
│   │   │   ├── Payment.java
│   │   │   ├── FareClass.java
│   │   │   └── AdditionalService.java
│   │   │
│   │   ├── enums/
│   │   │   ├── BookingStatus.java
│   │   │   ├── PaymentStatus.java
│   │   │   ├── ServiceType.java
│   │   │   └── FareClassType.java
│   │   │
│   │   ├── repository/            # JPA Repository Interfaces
│   │   │   ├── ProfileRepository.java  # User synced from Supabase Auth
│   │   │   ├── FlightRepository.java
│   │   │   ├── BookingRepository.java
│   │   │   ├── PassengerRepository.java
│   │   │   ├── PaymentRepository.java
│   │   │   ├── FareClassRepository.java
│   │   │   └── ServiceRepository.java
│   │   │
│   │   └── valueobject/
│   │       ├── Money.java
│   │       └── Route.java
│   │
│   ├── infrastructure/            # Infrastructure Layer
│   │   ├── security/
│   │   │   └── SupabaseJwtFilter.java
│   │   │
│   │   ├── persistence/
│   │   │   └── entity/
│   │   │       └── // JPA Entity Implementations
│   │   │
│   │   └── external/              # External Services
│   │       └── PaymentGatewayClient.java
│   │
│   └── pattern/                   # DESIGN PATTERNS ⭐
│       ├── strategy/              # STRATEGY PATTERN
│       │   ├── PricingStrategy.java           # Interface
│       │   ├── EconomyPricingStrategy.java
│       │   ├── PremiumPricingStrategy.java
│       │   ├── BusinessPricingStrategy.java
│       │   └── PricingContext.java
│       │
│       ├── state/                # STATE PATTERN
│       │   ├── BookingState.java             # Interface
│       │   ├── BookingStateContext.java
│       │   ├── PendingState.java
│       │   ├── ConfirmedState.java
│       │   ├── CancelledState.java
│       │   └── PaymentFailedState.java
│       │
│       ├── observer/              # OBSERVER PATTERN
│       │   ├── BookingObserver.java          # Interface
│       │   ├── BookingSubject.java
│       │   ├── EmailNotificationObserver.java
│       │   ├── SmsNotificationObserver.java
│       │   └── AdminNotificationObserver.java
│       │
│       └── factory/               # FACTORY PATTERN
│           ├── TicketFactory.java
│           ├── ETicketFactory.java
│           └── BoardingPassFactory.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   │
│   └── db/migration/              # Flyway
│       ├── V1__init_schema.sql
│       ├── V2__seed_data.sql
│       └── V3__add_fare_classes.sql
│
├── src/test/java/com/airline/
│   ├── controller/
│   │   ├── AuthControllerTest.java
│   │   ├── FlightControllerTest.java
│   │   └── BookingControllerTest.java
│   │
│   ├── service/
│   │   ├── BookingServiceTest.java
│   │   └── FlightServiceTest.java
│   │
│   └── pattern/                   # PATTERN TESTS ⭐
│       ├── strategy/
│       │   └── PricingStrategyTest.java
│       ├── state/
│       │   └── BookingStateTest.java
│       ├── observer/
│       │   └── ObserverNotificationTest.java
│       └── factory/
│           └── TicketFactoryTest.java
│
├── pom.xml
└── Dockerfile
```

### 3.2 Layer Responsibilities

| Layer | Responsibility | Dependencies |
|-------|-----------------|---------------|
| **presentation** | HTTP handling, DTO conversion | application |
| **application** | Business logic, orchestration | domain |
| **domain** | Business rules, entities | None (pure Java) |
| **infrastructure** | External integrations | domain, application |
| **pattern** | Pattern implementations | domain |

### 3.3 Package Dependencies

```
presentation (Controller, DTO, Exception)
    ↓ depends on
application (Service)
    ↓ depends on
domain (Entity, Repository interfaces)
    ↓ used by
infrastructure (Security, Persistence)
    ↓ implements
domain (Repository interfaces)
```

---

## 4. Frontend Architecture (React)

### 4.1 Directory Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
│
├── src/
│   ├── main.jsx                   # Entry point
│   ├── App.jsx                    # Root component
│   ├── App.css
│   │
│   ├── lib/                       # Supabase Client
│   │   └── supabase.js
│   │
│   ├── api/                       # API Client Layer
│   │   ├── apiClient.js           # Axios instance with Supabase Auth
│   │   ├── flightApi.js
│   │   ├── bookingApi.js
│   │   └── paymentApi.js
│   │
│   ├── components/                # Reusable Components
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── StatusBadge.jsx
│   │   │
│   │   ├── flight/
│   │   │   ├── FlightCard.jsx
│   │   │   ├── FlightList.jsx
│   │   │   ├── FlightSearch.jsx
│   │   │   └── FlightFilter.jsx
│   │   │
│   │   ├── booking/
│   │   │   ├── BookingSummary.jsx
│   │   │   ├── PassengerForm.jsx
│   │   │   ├── ServiceSelector.jsx
│   │   │   └── BookingStatus.jsx
│   │   │
│   │   ├── payment/
│   │   │   ├── PaymentForm.jsx
│   │   │   └── PaymentConfirmation.jsx
│   │   │
│   │   └── layout/
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       ├── Sidebar.jsx
│   │       └── Navbar.jsx
│   │
│   ├── pages/                     # Route Pages
│   │   ├── HomePage.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   │
│   │   ├── flight/
│   │   │   ├── FlightSearchPage.jsx
│   │   │   ├── FlightListPage.jsx
│   │   │   └── FlightDetailPage.jsx
│   │   │
│   │   ├── booking/
│   │   │   ├── BookingPage.jsx
│   │   │   ├── PassengerInfoPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   └── BookingConfirmationPage.jsx
│   │   │
│   │   ├── user/
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── MyBookingsPage.jsx
│   │   │   └── BookingDetailPage.jsx
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminFlightManagement.jsx
│   │       ├── AdminBookingManagement.jsx
│   │       ├── AdminUserManagement.jsx
│   │       └── AdminFareManagement.jsx
│   │
│   ├── context/                   # React Context
│   │   ├── AuthContext.jsx
│   │   ├── BookingContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── hooks/                     # Custom Hooks
│   │   ├── useAuth.js
│   │   ├── useBooking.js
│   │   ├── useFlightSearch.js
│   │   └── useNotification.js
│   │
│   ├── utils/                     # Utilities
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── formatters.js          # Date, Currency formatters
│   │
│   └── styles/                    # Global Styles
│       ├── variables.css          # CSS Variables
│       ├── reset.css
│       ├── typography.css
│       └── components/
│
├── tailwind.config.js             # Tailwind Configuration
├── vite.config.js
├── package.json
└── Dockerfile
```

### 4.2 Component Hierarchy

```
App
├── Router
│   ├── Public Routes
│   │   ├── / → HomePage
│   │   ├── /login → LoginPage
│   │   └── /register → RegisterPage
│   │
│   ├── Protected Routes (User)
│   │   ├── /flights → FlightSearchPage
│   │   ├── /flights/:id → FlightDetailPage
│   │   ├── /booking/:flightId → BookingPage
│   │   ├── /booking/:flightId/passengers → PassengerInfoPage
│   │   ├── /booking/:flightId/payment → PaymentPage
│   │   ├── /booking/confirmation → BookingConfirmationPage
│   │   └── /my-bookings → MyBookingsPage
│   │
│   └── Protected Routes (Admin)
│       ├── /admin → AdminDashboard
│       ├── /admin/flights → AdminFlightManagement
│       ├── /admin/bookings → AdminBookingManagement
│       ├── /admin/users → AdminUserManagement
│       └── /admin/fares → AdminFareManagement
│
└── Layout Components
    ├── Header (always visible)
    ├── Navbar (authenticated)
    └── Sidebar (admin only)
```

---

## 5. Design Patterns Implementation

### 5.1 Strategy Pattern - Pricing

**Purpose:** Calculate prices based on fare class type

**Class Diagram:**
```
┌─────────────────────────────────────────────────────────────┐
│                    <<interface>>                            │
│                   PricingStrategy                           │
├─────────────────────────────────────────────────────────────┤
│ + calculatePrice(basePrice: Money, passengers: int): Money  │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│    Economy     │  │   Premium     │  │   Business    │
│   Pricing     │  │   Pricing     │  │   Pricing     │
├───────────────┤  ├───────────────┤  ├───────────────┤
│ multiplier:   │  │ multiplier:   │  │ multiplier:   │
│    1.0       │  │    1.5       │  │    2.5       │
├───────────────┤  ├───────────────┤  ├───────────────┤
│ + calculate   │  │ + calculate   │  │ + calculate   │
│   Price()     │  │   Price()     │  │   Price()     │
└───────────────┘  └───────────────┘  └───────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PricingContext                          │
├─────────────────────────────────────────────────────────────┤
│ - strategy: PricingStrategy                                 │
├─────────────────────────────────────────────────────────────┤
│ + setStrategy(strategy: PricingStrategy): void             │
│ + executeStrategy(basePrice, passengers): Money            │
└─────────────────────────────────────────────────────────────┘
```

**Code Example:**
```java
// Strategy Interface
public interface PricingStrategy {
    Money calculatePrice(Money basePrice, int passengerCount);
}

// Concrete Strategy - Economy
public class EconomyPricingStrategy implements PricingStrategy {
    private static final BigDecimal MULTIPLIER = new BigDecimal("1.0");
    
    @Override
    public Money calculatePrice(Money basePrice, int passengerCount) {
        BigDecimal total = basePrice.getAmount()
            .multiply(MULTIPLIER)
            .multiply(new BigDecimal(passengerCount));
        return new Money(total, basePrice.getCurrency());
    }
}

// Context
public class PricingContext {
    private PricingStrategy strategy;
    
    public void setStrategy(PricingStrategy strategy) {
        this.strategy = strategy;
    }
    
    public Money executeStrategy(Money basePrice, int passengerCount) {
        return strategy.calculatePrice(basePrice, passengerCount);
    }
}
```

### 5.2 State Pattern - Booking Lifecycle

**Purpose:** Manage booking state transitions

**State Diagram:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BOOKING STATE MACHINE                           │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   PENDING   │
                              │  (Initial)  │
                              └──────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
     ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
     │   CONFIRMED   │      │   CANCELLED   │      │PAYMENT_FAILED │
     │               │      │               │      │               │
     └───────┬───────┘      └───────────────┘      └───────┬───────┘
             │                                              │
             │         ┌─────────────────────────────────────┘
             │         │
             ▼         ▼
    ┌───────────────┐
    │   COMPLETED   │  (Terminal)
    │   (Boarded)   │
    └───────────────┘
```

**State Transition Rules:**
| From State | To State | Trigger | Action |
|------------|----------|---------|--------|
| PENDING | CONFIRMED | Payment success | Send confirmation |
| PENDING | CANCELLED | User cancel | Release seats |
| PENDING | PAYMENT_FAILED | Payment fail | Notify user |
| CONFIRMED | COMPLETED | Boarding complete | Update status |
| CONFIRMED | CANCELLED | User cancel (within 24h) | Apply cancellation policy |

**Code Example:**
```java
// State Interface
public interface BookingState {
    void confirm(BookingContext context);
    void cancel(BookingContext context);
    void markPaymentFailed(BookingContext context);
    void complete(BookingContext context);
    BookingStatus getStatus();
}

// Concrete State - Pending
public class PendingState implements BookingState {
    
    @Override
    public void confirm(BookingContext context) {
        context.setState(new ConfirmedState());
        context.notifyObservers("Booking confirmed!");
    }
    
    @Override
    public void cancel(BookingContext context) {
        context.getBooking().releaseSeats();
        context.setState(new CancelledState());
        context.notifyObservers("Booking cancelled.");
    }
    
    @Override
    public void markPaymentFailed(BookingContext context) {
        context.setState(new PaymentFailedState());
        context.notifyObservers("Payment failed.");
    }
    
    @Override
    public void complete(BookingContext context) {
        throw new IllegalStateException("Cannot complete pending booking");
    }
    
    @Override
    public BookingStatus getStatus() {
        return BookingStatus.PENDING;
    }
}

// Context
public class BookingStateContext {
    private BookingState state;
    private Booking booking;
    private List<BookingObserver> observers = new ArrayList<>();
    
    public void setState(BookingState state) {
        this.state = state;
    }
    
    public void confirm() {
        state.confirm(this);
    }
    
    public void addObserver(BookingObserver observer) {
        observers.add(observer);
    }
    
    public void notifyObservers(String message) {
        observers.forEach(o -> o.onBookingStateChange(booking, message));
    }
}
```

### 5.3 Observer Pattern - Notifications

**Purpose:** Notify users and admins of booking changes

**Class Diagram:**
```
┌─────────────────────────────────────────────────────────────┐
│                     BookingSubject                          │
├─────────────────────────────────────────────────────────────┤
│ - observers: List<BookingObserver>                         │
├─────────────────────────────────────────────────────────────┤
│ + attach(observer: BookingObserver): void                 │
│ + detach(observer: BookingObserver): void                 │
│ + notify(message: String): void                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ notifies
                            ▼
        ┌─────────────────────────────────────────┐
        │         <<interface>>                   │
        │         BookingObserver                 │
        ├─────────────────────────────────────────┤
        │ + onBookingStateChange(booking, msg)    │
        └─────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│    Email      │  │     SMS       │  │    Admin      │
│ Notification  │  │ Notification  │  │ Notification  │
├───────────────┤  ├───────────────┤  ├───────────────┤
│ - emailService│  │ - smsService  │  │ - adminEmail  │
├───────────────┤  ├───────────────┤  ├───────────────┤
│ + onBooking   │  │ + onBooking   │  │ + onBooking   │
│   StateChange │  │   StateChange │  │   StateChange │
└───────────────┘  └───────────────┘  └───────────────┘
```

**Code Example:**
```java
// Subject
public class BookingSubject {
    private List<BookingObserver> observers = new ArrayList<>();
    private Booking booking;
    
    public void attach(BookingObserver observer) {
        observers.add(observer);
    }
    
    public void detach(BookingObserver observer) {
        observers.remove(observer);
    }
    
    public void notifyAll(String message) {
        for (BookingObserver observer : observers) {
            observer.onBookingStateChange(booking, message);
        }
    }
}

// Observer Interface
public interface BookingObserver {
    void onBookingStateChange(Booking booking, String message);
}

// Concrete Observer - Email
public class EmailNotificationObserver implements BookingObserver {
    private EmailService emailService;
    
    @Override
    public void onBookingStateChange(Booking booking, String message) {
        String email = booking.getUser().getEmail();
        emailService.send(email, "Booking Update", message);
    }
}
```

### 5.4 Factory Pattern - Ticket Creation

**Purpose:** Create different types of tickets

**Class Diagram:**
```
┌─────────────────────────────────────────────────────────────┐
│                    TicketFactory                            │
├─────────────────────────────────────────────────────────────┤
│ + createTicket(booking: Booking): Ticket                   │
│ + createETicket(booking: Booking): ETicket                 │
│ + createBoardingPass(booking: Booking): BoardingPass       │
└─────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────────────┐
         │                    Ticket                         │
         ├──────────────────────────────────────────────────┤
         │ - bookingRef: String                              │
         │ - passenger: Passenger                           │
         │ - flight: Flight                                 │
         │ - issuedAt: LocalDateTime                        │
         └──────────────────────────────────────────────────┘
         
         ┌──────────────────────────────────────────────────┐
         │                   ETicket                         │
         ├──────────────────────────────────────────────────┤
         │ - barcode: String                                │
         │ - pdfUrl: String                                 │
         │ - qrCode: String                                │
         └──────────────────────────────────────────────────┘
         
         ┌──────────────────────────────────────────────────┐
         │                  BoardingPass                     │
         ├──────────────────────────────────────────────────┤
         │ - gate: String                                  │
         │ - seat: String                                  │
         │ - boardingTime: LocalDateTime                   │
         │ - boardingGroup: String                         │
         └──────────────────────────────────────────────────┘
```

**Code Example:**
```java
// Factory
public class TicketFactory {
    
    public Ticket createTicket(Booking booking) {
        Ticket ticket = new Ticket();
        ticket.setBookingRef(booking.getReference());
        ticket.setPassenger(booking.getPrimaryPassenger());
        ticket.setFlight(booking.getFlight());
        ticket.setIssuedAt(LocalDateTime.now());
        return ticket;
    }
    
    public ETicket createETicket(Booking booking) {
        Ticket base = createTicket(booking);
        ETicket eticket = new ETicket(base);
        eticket.setBarcode(generateBarcode());
        eticket.setPdfUrl(generatePdf(base));
        eticket.setQrCode(generateQrCode(base));
        return eticket;
    }
    
    public BoardingPass createBoardingPass(Booking booking) {
        Ticket base = createTicket(booking);
        BoardingPass pass = new BoardingPass(base);
        pass.setGate(assignGate(booking.getFlight()));
        pass.setSeat(booking.getPrimaryPassenger().getSeatNumber());
        pass.setBoardingTime(calculateBoardingTime(booking.getFlight()));
        pass.setBoardingGroup(assignBoardingGroup(booking.getFareClass()));
        return pass;
    }
    
    private String generateBarcode() {
        return UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
```

### 5.5 Design Patterns Summary

| Pattern | Purpose | Classes | Use Case |
|---------|---------|---------|----------|
| **Strategy** | Dynamic pricing calculation | `PricingStrategy`, `EconomyPricingStrategy`, `PremiumPricingStrategy`, `BusinessPricingStrategy` | Price calculation by fare class |
| **State** | Booking lifecycle management | `BookingState`, `PendingState`, `ConfirmedState`, `CancelledState`, `PaymentFailedState` | State transitions |
| **Observer** | Event notifications | `BookingSubject`, `BookingObserver`, `EmailNotificationObserver`, `SmsNotificationObserver` | Booking status updates |
| **Factory** | Object creation | `TicketFactory`, `ETicketFactory`, `BoardingPassFactory` | Ticket generation |

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    profiles     │     │    flights      │     │  fare_classes   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK, UUID)   │     │ id (PK)         │     │ id (PK)         │
│ email           │     │ flight_number   │     │ type            │
│ full_name       │     │ origin          │     │ multiplier      │
│ role_id (FK)    │     │ destination     │     │ benefits        │
│ created_at      │     │ departure_time  │     │ max_baggage     │
│ updated_at      │     │ arrival_time    │     │ refundable      │
└────────┬────────┘     │ price_economy   │     │ created_at      │
         │              │ price_premium   │     └─────────────────┘
         │              │ price_business  │              │
         │              │ available_seats │              │
         │              │ status          │              │
         │              │ created_at      │              │
         │              └────────┬────────┘              │
         │                       │                       │
         │              ┌────────┴────────┐            │
         │              │                 │            │
         ▼              ▼                 ▼            │
┌─────────────────┐     │    ┌─────────────────┐      │
│    bookings     │◀────┘     │flight_fare_class │─────┘
├─────────────────┤           └─────────────────┘
│ id (PK)         │
│ user_id(FK,UUID)│◀──────────────────────────────────┐
│ flight_id (FK)  │                                    │
│ fare_class_id   │                                    │
│ status          │                                    │
│ total_price     │                                    │
│ booking_ref     │                                    │
│ created_at      │                                    │
│ updated_at      │                                    │
└────────┬────────┘                                    │
         │                                            │
         │    ┌─────────────────┐                     │
         │    │   passengers    │                     │
         │    ├─────────────────┤                     │
         │    │ id (PK)         │                     │
         └───▶│ booking_id (FK)│                     │
         │    │ first_name      │                     │
         │    │ last_name      │                     │
         │    │ date_of_birth  │                     │
         │    │ passport_number│                     │
         │    │ seat_number    │                     │
         │    │ meal_preference│                     │
         │    └─────────────────┘                     │
         │                                            │
         │    ┌─────────────────┐                     │
         │    │    payments     │                     │
         │    ├─────────────────┤                     │
         └───▶│ id (PK)         │                     │
              │ booking_id (FK)│                     │
              │ amount         │                     │
              │ payment_method │                     │
              │ transaction_id │                     │
              │ status         │                     │
              │ paid_at        │                     │
              └─────────────────┘                     │
                                                   │
         ┌──────────────────────────────────────────┘
         │
         │    ┌─────────────────────────────────────┐
         │    │ booking_additional_services (M:M)   │
         │    ├─────────────────────────────────────┤
         └───▶│ booking_id (FK)                     │
              │ service_id (FK)                     │
              │ quantity                            │
              │ price                               │
              └─────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │ additional_services      │
         ├─────────────────────────┤
         │ id (PK)                 │
         │ type                    │
         │ name                    │
         │ price                   │
         │ available               │
         └─────────────────────────┘
```

### 6.2 Table Definitions

#### profiles
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID from Supabase Auth |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| full_name | VARCHAR(255) | NOT NULL | Full name |
| role_id | BIGINT | NOT NULL, REFERENCES roles(id) | Role reference |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

#### flights
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Flight ID |
| flight_number | VARCHAR(10) | UNIQUE, NOT NULL | Flight number (e.g., "VN123") |
| origin | VARCHAR(3) | NOT NULL | Origin airport code |
| destination | VARCHAR(3) | NOT NULL | Destination airport code |
| departure_time | TIMESTAMP | NOT NULL | Departure time |
| arrival_time | TIMESTAMP | NOT NULL | Arrival time |
| price_economy | DECIMAL(10,2) | NOT NULL | Economy class price |
| price_premium | DECIMAL(10,2) | NOT NULL | Premium class price |
| price_business | DECIMAL(10,2) | NOT NULL | Business class price |
| available_seats | INTEGER | NOT NULL | Available seats |
| status | VARCHAR(20) | NOT NULL | SCHEDULED, DELAYED, CANCELLED |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

#### bookings
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Booking ID |
| user_id | UUID | FK → profiles | User who made booking |
| flight_id | BIGINT | FK → flights | Booked flight |
| fare_class_id | BIGINT | FK → fare_classes | Selected fare class |
| status | VARCHAR(20) | NOT NULL | PENDING, CONFIRMED, CANCELLED, PAYMENT_FAILED, COMPLETED |
| total_price | DECIMAL(10,2) | NOT NULL | Total booking price |
| booking_ref | VARCHAR(10) | UNIQUE | Booking reference code |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

#### passengers
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Passenger ID |
| booking_id | BIGINT | FK → bookings | Associated booking |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| date_of_birth | DATE | NOT NULL | Date of birth |
| passport_number | VARCHAR(20) | NOT NULL | Passport number |
| seat_number | VARCHAR(5) | | Assigned seat |
| meal_preference | VARCHAR(20) | | MEAL, VEGETARIAN, VEGAN, NONE |

#### payments
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Payment ID |
| booking_id | BIGINT | FK → bookings | Associated booking |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| payment_method | VARCHAR(20) | NOT NULL | CREDIT_CARD, BANK_TRANSFER |
| transaction_id | VARCHAR(100) | UNIQUE | External transaction ID |
| status | VARCHAR(20) | NOT NULL | PENDING, SUCCESS, FAILED |
| paid_at | TIMESTAMP | | Payment timestamp |

#### fare_classes
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Fare class ID |
| type | VARCHAR(20) | UNIQUE, NOT NULL | ECONOMY, PREMIUM, BUSINESS |
| multiplier | DECIMAL(3,2) | NOT NULL | Price multiplier |
| benefits | TEXT | | Benefits description |
| max_baggage | INTEGER | | Max baggage allowance (kg) |
| refundable | BOOLEAN | DEFAULT FALSE | Refundable flag |

#### additional_services
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Service ID |
| type | VARCHAR(50) | NOT NULL | BAGGAGE, MEAL, SEAT, INSURANCE |
| name | VARCHAR(100) | NOT NULL | Service name |
| price | DECIMAL(10,2) | NOT NULL | Service price |
| available | BOOLEAN | DEFAULT TRUE | Availability flag |

---

## 7. API Flow Diagrams

### 7.1 Booking Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BOOKING FLOW SEQUENCE                              │
└─────────────────────────────────────────────────────────────────────────┘

User          Frontend              Backend                    Database
 │               │                     │                          │
 │  1. Search    │                     │                          │
 │  ──────────▶  │                     │                          │
 │               │  2. GET /flights    │                          │
 │               │  ─────────────────▶ │                          │
 │               │                     │  3. SELECT * FROM flights │
 │               │                     │  ────────────────────────▶│
 │               │                     │◀──────────────────────────│
 │               │◀────────────────────│                          │
 │◀──────────────│                     │                          │
 │               │                     │                          │
 │  4. Select    │                     │                          │
 │  flight       │                     │                          │
 │  ──────────▶  │                     │                          │
 │               │                     │                          │
 │  5. Enter     │                     │                          │
 │  passenger    │                     │                          │
 │  info         │                     │                          │
 │  ──────────▶  │                     │                          │
 │               │  6. POST /bookings  │                          │
 │               │  ─────────────────▶ │                          │
 │               │                     │  7. INSERT booking       │
 │               │                     │  ────────────────────────▶│
 │               │                     │  8. UPDATE seats         │
 │               │                     │  ────────────────────────▶│
 │               │                     │                          │
 │               │◀────────────────────│  Booking created (PENDING)
 │◀──────────────│                     │                          │
 │               │                     │                          │
 │  9. Payment   │                     │                          │
 │  ──────────▶  │                     │                          │
 │               │ 10. POST /payments  │                          │
 │               │  ─────────────────▶ │                          │
 │               │                     │ 11. Process payment      │
 │               │                     │    (External Gateway)    │
 │               │                     │                          │
 │               │                     │ 12. UPDATE booking status│
 │               │                     │  ────────────────────────▶│
 │               │                     │                          │
 │               │                     │ 13. Notify observers     │
 │               │                     │    (Email, SMS, Admin)    │
 │               │                     │                          │
 │               │◀────────────────────│  Payment confirmed      │
 │◀──────────────│                     │                          │
 │               │                     │                          │
 │ 14. Success   │                     │                          │
 │  page         │                     │                          │
 │◀──────────────│                     │                          │
```

### 7.2 State Transition Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STATE TRANSITION FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

     ┌──────────────────────────────────────────────────────────────┐
     │                        USER ACTIONS                          │
     └──────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │  Book    │   │  Pay     │   │  Cancel  │
              │  Flight  │   │  ment    │   │  Booking │
              └────┬─────┘   └────┬─────┘   └────┬─────┘
                   │              │              │
                   ▼              ▼              ▼
     ┌─────────────┴──────────────┴──────────────┴─────────────┐
     │                                                          │
     │  ┌─────────────────────────────────────────────────────┐  │
     │  │              BOOKING STATE MACHINE                  │  │
     │  │                                                      │  │
     │  │   [PENDING]                                         │  │
     │  │      │                                              │  │
     │  │      ├── Payment OK ──────▶ [CONFIRMED]             │  │
     │  │      │                         │                   │  │
     │  │      │                         └── Boarding ──▶    │  │
     │  │      │                              [COMPLETED]     │  │
     │  │      │                                              │  │
     │  │      ├── Payment Fail ──▶ [PAYMENT_FAILED]          │  │
     │  │      │                                              │  │
     │  │      └── User Cancel ──▶ [CANCELLED]               │  │
     │  │                                                      │  │
     │  └─────────────────────────────────────────────────────┘  │
     │                                                          │
     └──────────────────────────────────────────────────────────┘
                                    │
                                    ▼
     ┌────────────────────────────────────────────────────────────┐
     │                    OBSERVER NOTIFICATIONS                  │
     │                                                          │
     │   Booking State Change ──▶ [Email] ──▶ User email       │
     │                    │                                      │
     │                    ├──▶ [SMS] ──────▶ User phone         │
     │                    │                                      │
     │                    └──▶ [Admin] ────▶ Admin dashboard    │
     │                                                          │
     └────────────────────────────────────────────────────────────┘
```

### 7.3 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                                │
│                                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │   Login  │───▶│  Search  │───▶│  Book    │───▶│  Pay     │───▶ Done│
│  │   Page   │    │  Flights │    │  Flight  │    │  ment    │         │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘         │
│       │               │               │               │                 │
└───────┼───────────────┼───────────────┼───────────────┼─────────────────┘
        │               │               │               │
        ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Spring Boot)                           │
│                                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐              │
│  │   Auth       │   │   Flight      │   │   Booking     │              │
│  │   Controller │   │   Controller  │   │   Controller  │              │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘              │
│         │                  │                  │                          │
│         ▼                  ▼                  ▼                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐              │
│  │ AuthService  │   │ FlightService│   │ BookingService│              │
│  │  +JWT Token  │   │  +Search    │   │  +State Pattern│              │
│  └──────────────┘   └──────────────┘   └──────┬───────┘              │
│                                               │                          │
│         ┌─────────────────────────────────────┼────────────────────┐    │
│         │              PATTERN LAYER ⭐         │                    │    │
│         │                                       ▼                    │    │
│         │   ┌─────────────────────────────────────────────┐        │    │
│         │   │              BOOKING STATE MACHINE          │        │    │
│         │   │                                             │        │    │
│         │   │   [PENDING] ──┬──▶ [CONFIRMED] ──▶ [COMPLETED]    │    │
│         │   │       │      │            │                      │    │
│         │   │       │      ▼            ▼                      │    │
│         │   │       │   [FAILED]    [CANCELLED]                │    │
│         │   │       │                                       │        │    │
│         │   └─────────────────────────────────────────────┘        │    │
│         │                                                             │    │
│         │   ┌─────────────────────────────────────────────┐        │    │
│         │   │           PRICING STRATEGY                   │        │    │
│         │   │                                             │        │    │
│         │   │   Base × Multiplier ──▶ Final Price         │        │    │
│         │   │   (Economy/Premium/Business)               │        │    │
│         │   └─────────────────────────────────────────────┘        │    │
│         │                                                             │    │
│         │   ┌─────────────────────────────────────────────┐        │    │
│         │   │           NOTIFICATION OBSERVER               │        │    │
│         │   │                                             │        │    │
│         │   │   BookingChange ──▶ [Email, SMS, Admin]     │        │    │
│         │   └─────────────────────────────────────────────┘        │    │
│         │                                                             │    │
│         │   ┌─────────────────────────────────────────────┐        │    │
│         │   │           TICKET FACTORY                     │        │    │
│         │   │                                             │        │    │
│         │   │   Booking ──▶ [Ticket/ETicket/BoardingPass] │        │    │
│         │   └─────────────────────────────────────────────┘        │    │
│         │                                                             │    │
│         └─────────────────────────────────────────────────────────────┘    │
│                                │                                          │
│                                ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        DATABASE (PostgreSQL)                        │  │
│  │  users │ flights │ bookings │ passengers │ payments │ fare_classes   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Components Mapping

### 8.1 Feature to Component Mapping

| Feature | Backend | Frontend |
|---------|---------|----------|
| **Authentication** | `SupabaseJwtFilter`, `SecurityConfig` | `LoginPage`, `RegisterPage`, `supabase.js`, `AuthContext` |
| **Flight Search** | `FlightController`, `FlightService` | `FlightSearchPage`, `FlightCard`, `FlightFilter` |
| **Booking Flow** | `BookingController`, `BookingService`, **State Pattern** | `BookingPage`, `PassengerForm`, `BookingSummary` |
| **Pricing** | `PricingService`, **Strategy Pattern** | `BookingSummary`, `ServiceSelector` |
| **Payment** | `PaymentController`, **Factory Pattern** | `PaymentPage`, `PaymentForm` |
| **Notifications** | `NotificationService`, **Observer Pattern** | `NotificationContext`, `Toast` |
| **Admin CRUD** | Admin endpoints | Admin pages |
| **User Dashboard** | User endpoints | `UserDashboard`, `MyBookingsPage` |

### 8.2 API Endpoints

#### Authentication & Profile
> Authentication is handled directly by Supabase Auth on the frontend. The backend does not expose auth endpoints — it only verifies Supabase-issued JWTs.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/me` | Get current user's profile |

#### Flights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights` | Search flights |
| GET | `/api/flights/{id}` | Get flight details |
| POST | `/api/flights` | Create flight (Admin) |
| PUT | `/api/flights/{id}` | Update flight (Admin) |
| DELETE | `/api/flights/{id}` | Delete flight (Admin) |

#### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get user bookings |
| GET | `/api/bookings/{id}` | Get booking details |
| PUT | `/api/bookings/{id}/cancel` | Cancel booking |
| GET | `/api/bookings/{ref}` | Get by reference |

#### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Process payment |
| GET | `/api/payments/{id}` | Get payment status |

#### Passengers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/{id}/passengers` | Add passengers |
| PUT | `/api/passengers/{id}` | Update passenger |
| DELETE | `/api/passengers/{id}` | Remove passenger |

#### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/bookings` | List all bookings |
| GET | `/api/admin/flights` | List all flights |
| PUT | `/api/admin/fares` | Manage fare classes |

---

## 9. Getting Started

### 9.1 Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### 9.2 Backend Setup

```bash
cd backend

# Build the project
./mvnw clean package

# Run tests
./mvnw test

# Run the application
./mvnw spring-boot:run
```

### 9.3 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### 9.4 Docker Setup

> Lưu ý: `docker-compose up` chỉ khởi động Backend và Frontend services. Cơ sở dữ liệu PostgreSQL và Auth được lưu trữ trên Supabase cloud.

```bash
# Start backend and frontend services
docker-compose up -d

# Stop services
docker-compose down
```

### 9.5 Environment Variables

#### Backend (.env)
```
SUPABASE_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.your-project-ref
SUPABASE_DB_PASSWORD=your-database-password
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Frontend (.env)
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:8080/api
```

---

## 10. Project Timeline (3 Weeks)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| **Week 1** | Setup project, DB schema, basic CRUD | Running app with flight listing |
| **Week 2** | Implement design patterns, booking flow | State machine, pricing strategy working |
| **Week 3** | Testing, polish, documentation | Unit tests, complete UI, final docs |

---

## 11. Grading Criteria Coverage

| Criteria | Implementation | Documented |
|-----------|----------------|------------|
| Design Patterns (4 patterns) | ✅ `pattern/` package | ✅ SSR.md, This Doc |
| Clean Architecture | ✅ Layered structure | ✅ System Architecture |
| SOLID Principles | ✅ Interface-based design | ✅ Comments in code |
| Unit Testing | ✅ Test classes | ✅ Test coverage |
| Database Design | ✅ Normalized schema | ✅ Database_Design.md |
| API Design | ✅ RESTful endpoints | ✅ API documentation |
| Frontend Integration | ✅ React + Vite | ✅ UI_Design.md |
| Documentation | ✅ UML diagrams, README | ✅ All .md files |

---

*Document created for Airline Booking System with Design Patterns Project*
