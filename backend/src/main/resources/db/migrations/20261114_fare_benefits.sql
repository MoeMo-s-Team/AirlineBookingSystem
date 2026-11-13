-- Run in Supabase SQL Editor before deploying the updated backend (ddl-auto=validate).
-- Safe to run again; existing values set by administrators are preserved.
BEGIN;
ALTER TABLE public.fare_classes ADD COLUMN IF NOT EXISTS baggage VARCHAR(255);
ALTER TABLE public.fare_classes ADD COLUMN IF NOT EXISTS seat_pitch VARCHAR(255);
ALTER TABLE public.fare_classes ADD COLUMN IF NOT EXISTS meal VARCHAR(255);

UPDATE public.fare_classes SET
  baggage = COALESCE(baggage, CASE UPPER(code)
    WHEN 'ECONOMY' THEN '7kg cabin baggage, 20kg checked'
    WHEN 'PREMIUM' THEN '10kg cabin baggage, 30kg checked'
    WHEN 'BUSINESS' THEN '2x 10kg cabin, 40kg priority baggage' END),
  seat_pitch = COALESCE(seat_pitch, CASE UPPER(code)
    WHEN 'ECONOMY' THEN 'Standard 30-31 inch legroom'
    WHEN 'PREMIUM' THEN 'Extra 34-36 inch pitch with leg-rest'
    WHEN 'BUSINESS' THEN 'Full flat-bed seat with direct aisle access' END),
  meal = COALESCE(meal, CASE UPPER(code)
    WHEN 'ECONOMY' THEN 'Complimentary snack & water'
    WHEN 'PREMIUM' THEN 'Hot meal selection & beverages'
    WHEN 'BUSINESS' THEN 'Chef-curated gourmet dining & fine wines' END);
COMMIT;
