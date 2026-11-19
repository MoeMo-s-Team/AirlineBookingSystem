ALTER TABLE public.flight_change_deliveries
    ADD COLUMN IF NOT EXISTS seats_changed BOOLEAN NOT NULL DEFAULT FALSE;
