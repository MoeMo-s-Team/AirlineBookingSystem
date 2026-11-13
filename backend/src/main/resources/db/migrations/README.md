# Manual database migrations

The application uses Hibernate `ddl-auto: validate` and does not automatically run
the SQL files in this directory.

Before starting the backend with fare benefit fields, run
`20261114_fare_benefits.sql` in the Supabase SQL Editor against the existing database.
It adds `baggage`, `seat_pitch`, and `meal`, and fills missing values for the three
standard fare codes. Existing non-null administrator values are preserved.
Custom fare codes can be configured through the admin fare editor.

For a new database, `../init.sql` already includes these columns and seed values.
