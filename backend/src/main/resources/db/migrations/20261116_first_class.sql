-- Keep existing administrator prices and avoid duplicating the FIRST alias.
INSERT INTO public.fare_classes (code, name, price_multiplier, active, baggage, seat_pitch, meal)
SELECT 'FIRST_CLASS', 'First Class', 3.50, true,
       '2x 10kg cabin, 50kg priority baggage',
       'Private suite with full flat-bed seat',
       'A la carte dining and premium beverages'
WHERE NOT EXISTS (
    SELECT 1 FROM public.fare_classes WHERE upper(trim(code)) IN ('FIRST', 'FIRST_CLASS')
);
