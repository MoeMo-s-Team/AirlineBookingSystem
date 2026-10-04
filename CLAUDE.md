## Project Overview

Airline Booking System — a full-stack web application for booking flights with multiple fare classes and ancillary services. Built with Java Spring Boot, React, and Supabase PostgreSQL.

**Key distinction**: Authentication is handled by Supabase Auth (frontend-only). Backend only verifies Supabase-issued JWTs via `SupabaseJwtFilter`.

## Commands

### Backend (Spring Boot)

```bash
cd backend
mvn clean install           # Build
mvn spring-boot:run         # Run dev server (port 8080)
mvn test                    # Run all tests
mvn test -Dtest=ClassName  # Run single test class
```

### Frontend (React + Vite)

```bash
cd frontend
pnpm install               # Install dependencies
pnpm dev                   # Run dev server (port 5173)
pnpm build                 # Production build
```

### Docker

```bash
docker-compose up -d        # Start backend + frontend
docker-compose down         # Stop services
```

### API Documentation

- Swagger UI: `http://localhost:8080/swagger-ui.html`

## Architecture

```
frontend/                    backend/
├── src/api/            →   └── src/main/java/com/airline/
├── src/components/          ├── config/           # SecurityConfig, SupabaseProperties
├── src/pages/               ├── presentation/     # Controllers, DTOs, Exceptions
├── src/context/             ├── application/      # Services, Mappers
├── src/hooks/               ├── domain/          # Entities, Repositories, Enums
└── src/lib/supabase.js      ├── infrastructure/   # JWT filter, external clients
                            └── pattern/           # Design pattern implementations ⭐
```

### Layer Dependencies

```
presentation → application → domain ← infrastructure
```

- **presentation**: HTTP handling, DTOs, exception mapping
- **application**: Business logic, orchestration
- **domain**: Entities, repository interfaces (pure Java, no dependencies)
- **infrastructure**: Security, external integrations, repository implementations

## Design Patterns (`pattern/` package)

| Pattern       | Classes                                                                    | Purpose                             |
| ------------- | -------------------------------------------------------------------------- | ----------------------------------- |
| **Strategy**  | `PricingStrategy`, `Economy/Premium/BusinessPricingStrategy`               | Price calculation by fare class     |
| **State**     | `BookingState`, `Pending/Confirmed/Cancelled/PaymentFailedState`           | Booking lifecycle transitions       |
| **Observer**  | `BookingSubject`, `BookingObserver`, `Email/Sms/AdminNotificationObserver` | Booking status change notifications |
| **Factory**   | `TicketFactory`, `ETicketFactory`, `BoardingPassFactory`                   | Ticket creation                     |
| **Decorator** | `BookingPrice` + decorators                                                | Combine ancillary services          |
| **Facade**    | `BookingFacade`                                                            | Simplify booking workflow           |

## Authentication Flow

```
Frontend                          Backend
   │                                 │
   ├── Supabase Auth API ────────────┤ (signup/signin/signout handled directly)
   │                                 │
   ├── JWT token ────────────────────┼── SupabaseJwtFilter verifies token
   │                                 │   └── Sets SecurityContext
   │                                 │
   └── API calls with JWT ───────────┤ (authorized based on role)
```

- Supabase Auth manages users → creates profile via DB trigger on `auth.users`
- `profiles.id` = Supabase UUID, synced automatically
- Role check: JWT contains `role` claim (`CUSTOMER` or `ADMIN`)

## Pricing Formula (BR-002)

```
Ticket Price = flights.base_price × fare_classes.price_multiplier
Total Price  = Σ Ticket Price + Σ (booking_services.unit_price × quantity)
```

## Booking State Machine (BR-003)

```
PENDING → CONFIRMED / CANCELLED / PAYMENT_FAILED
```

State transitions are enforced by the State Pattern. `CANCELLED` is terminal.

## Database

- **Supabase PostgreSQL** (cloud-hosted)
- Key tables: `profiles`, `flights`, `fare_classes`, `bookings`, `passengers`, `payments`, `additional_services`, `booking_services`, `notifications`
- `auth.users` → `profiles` sync via database trigger

## Environment Variables

Backend (`backend/src/main/resources/.env` or system):

```
SUPABASE_DB_HOST=...
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.your-project-ref
SUPABASE_DB_PASSWORD=...
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_JWT_SECRET=...
SUPABASE_ANON_KEY=...
```

Frontend (`.env`):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=http://localhost:8080/api
```

## Key Files

| File                                                                               | Purpose                     |
| ---------------------------------------------------------------------------------- | --------------------------- |
| `backend/src/main/resources/application.yml`                                       | Spring Boot configuration   |
| `backend/src/main/java/com/airline/config/SecurityConfig.java`                     | Security + JWT filter setup |
| `backend/src/main/java/com/airline/infrastructure/security/SupabaseJwtFilter.java` | JWT verification            |
| `backend/src/main/java/com/airline/pattern/state/BookingStateContext.java`         | State pattern orchestrator  |
| `frontend/src/lib/supabase.js`                                                     | Supabase client setup       |
