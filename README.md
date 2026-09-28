# Airline Booking System

A full-stack web application for booking flights with multiple fare classes and ancillary services.

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.x, Spring Data JPA
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth

## Getting Started

### Prerequisites

- Java 21
- Node.js 18+
- pnpm
- Maven 3.8+
- Supabase account

### Environment Setup

1. Copy `.env.example` to `.env` and fill in your Supabase credentials

### Backend Development

```bash
cd backend
mvn spring-boot:run
```

### Frontend Development

```bash
cd frontend
pnpm install
pnpm dev
```

### Docker

```bash
docker-compose up -d
```

## API Documentation

Swagger UI: http://localhost:8080/swagger-ui.html
