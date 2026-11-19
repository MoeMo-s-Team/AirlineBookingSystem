-- Run once with the backend stopped, before deploying the booking-hold code.
BEGIN;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seats_held BOOLEAN NOT NULL DEFAULT FALSE;

-- Old PENDING bookings never reserved inventory. Expire them through the application
-- rather than allowing payment without a reservation or refunding unreserved seats.
UPDATE bookings
SET expires_at = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')
WHERE status = 'PENDING' AND expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_pending_expiry
    ON bookings (expires_at, id) WHERE status = 'PENDING';

COMMIT;
