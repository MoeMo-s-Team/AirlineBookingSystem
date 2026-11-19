# Manual database migrations

The application uses Hibernate `ddl-auto: validate` and does not automatically run
the SQL files in this directory.

Before starting the backend with fare benefit fields, run
`20261114_fare_benefits.sql` in the Supabase SQL Editor against the existing database.
It adds `baggage`, `seat_pitch`, and `meal`, and fills missing values for the three
standard fare codes. Existing non-null administrator values are preserved.
Custom fare codes can be configured through the admin fare editor.

For a new database, `../init.sql` already includes these columns and seed values.

For existing databases, apply `20261116_flight_updates_bundles.sql` if the
`flight_change_deliveries` table is missing, then apply
`20261119_flight_seat_notifications.sql` before starting the updated backend.
Apply `20261116_notification_realtime.sql` to enable live delivery on the customer
interface.
