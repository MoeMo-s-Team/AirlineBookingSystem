-- Run after 20261116_booking_holds.sql, with the backend stopped.
BEGIN;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_flight_id BIGINT REFERENCES flights(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_fare_class_id BIGINT REFERENCES fare_classes(id);
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_return_pair' AND conrelid = 'bookings'::regclass) THEN
ALTER TABLE bookings ADD CONSTRAINT bookings_return_pair CHECK (
    (return_flight_id IS NULL AND return_fare_class_id IS NULL) OR
    (return_flight_id IS NOT NULL AND return_fare_class_id IS NOT NULL AND return_flight_id <> flight_id)
);
END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_bookings_return_flight ON bookings(return_flight_id);
COMMIT;
