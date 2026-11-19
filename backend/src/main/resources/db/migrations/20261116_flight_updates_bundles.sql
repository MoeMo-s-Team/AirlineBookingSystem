BEGIN;
ALTER TABLE flights ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_discount DECIMAL(15,2) NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS flight_change_deliveries (
    id BIGSERIAL PRIMARY KEY,
    flight_id BIGINT NOT NULL,
    flight_number VARCHAR(20) NOT NULL,
    old_departure TIMESTAMP NOT NULL,
    old_arrival TIMESTAMP NOT NULL,
    departure TIMESTAMP NOT NULL,
    arrival TIMESTAMP NOT NULL,
    old_status VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_flight_change_pending ON flight_change_deliveries(id) WHERE processed = FALSE;
-- Google providers may supply `name` instead of `full_name`.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role_id)
    VALUES (NEW.id, NEW.email,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.raw_user_meta_data->>'name', ''),
        (SELECT id FROM public.roles WHERE name = 'CUSTOMER'));
    RETURN NEW;
END;
$$;
COMMIT;
