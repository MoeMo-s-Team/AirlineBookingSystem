-- ============================================================
-- Airline Booking System — Database Init Script
-- Target: Supabase PostgreSQL
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension (usually already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================================
-- 2. PROFILES (replaces old `users` table)
--    id is UUID matching auth.users(id) from Supabase Auth
-- ============================================================
CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    full_name   VARCHAR(255) NOT NULL,
    role_id     BIGINT NOT NULL REFERENCES roles(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Auto-create profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        (SELECT id FROM public.roles WHERE name = 'CUSTOMER')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. FLIGHTS
-- ============================================================
CREATE TABLE flights (
    id              BIGSERIAL PRIMARY KEY,
    flight_number   VARCHAR(20) NOT NULL UNIQUE,
    origin          VARCHAR(100) NOT NULL,
    destination     VARCHAR(100) NOT NULL,
    departure_time  TIMESTAMP NOT NULL,
    arrival_time    TIMESTAMP NOT NULL,
    base_price      DECIMAL(15,2) NOT NULL,
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_flights_search ON flights(origin, destination, departure_time);

-- ============================================================
-- 4. FARE CLASSES
-- ============================================================
CREATE TABLE fare_classes (
    id               BIGSERIAL PRIMARY KEY,
    code             VARCHAR(20) NOT NULL UNIQUE,
    name             VARCHAR(100) NOT NULL,
    price_multiplier DECIMAL(5,2) NOT NULL CHECK (price_multiplier > 0),
    active           BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 5. BOOKINGS
-- ============================================================
CREATE TABLE bookings (
    id            BIGSERIAL PRIMARY KEY,
    booking_code  VARCHAR(20) NOT NULL UNIQUE,
    user_id       UUID NOT NULL REFERENCES profiles(id),
    flight_id     BIGINT NOT NULL REFERENCES flights(id),
    fare_class_id BIGINT NOT NULL REFERENCES fare_classes(id),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_price   DECIMAL(15,2) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================================
-- 6. PASSENGERS
-- ============================================================
CREATE TABLE passengers (
    id            BIGSERIAL PRIMARY KEY,
    booking_id    BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    full_name     VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    passport_no   VARCHAR(50) NOT NULL,
    phone         VARCHAR(20) NOT NULL
);

-- ============================================================
-- 7. ADDITIONAL SERVICES
-- ============================================================
CREATE TABLE additional_services (
    id     BIGSERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    type   VARCHAR(30) NOT NULL,
    price  DECIMAL(15,2) NOT NULL CHECK (price >= 0),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 8. BOOKING SERVICES (N-M junction table)
-- ============================================================
CREATE TABLE booking_services (
    id          BIGSERIAL PRIMARY KEY,
    booking_id  BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id  BIGINT NOT NULL REFERENCES additional_services(id),
    quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price  DECIMAL(15,2) NOT NULL,
    UNIQUE (booking_id, service_id)
);

-- ============================================================
-- 9. PAYMENTS
-- ============================================================
CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    booking_id      BIGINT NOT NULL REFERENCES bookings(id),
    amount          DECIMAL(15,2) NOT NULL,
    payment_method  VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL,
    transaction_ref VARCHAR(100) UNIQUE,
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES profiles(id),
    booking_id  BIGINT REFERENCES bookings(id),
    type        VARCHAR(50) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Roles
INSERT INTO roles (name) VALUES ('CUSTOMER'), ('ADMIN');

-- Fare classes
INSERT INTO fare_classes (code, name, price_multiplier) VALUES
    ('ECONOMY',  'Economy',         1.00),
    ('PREMIUM',  'Premium Economy', 1.50),
    ('BUSINESS', 'Business',        2.50);

-- Additional services (prices in VND)
INSERT INTO additional_services (name, type, price) VALUES
    ('Extra Baggage 20kg', 'BAGGAGE',           500000),
    ('Special Meal',       'MEAL',              200000),
    ('Seat Selection',     'SEAT',              150000),
    ('Priority Boarding',  'PRIORITY_BOARDING', 300000);
