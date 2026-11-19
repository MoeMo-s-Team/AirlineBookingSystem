-- Run in the Supabase SQL editor. Realtime clients may only read their own rows.
BEGIN;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.notifications TO authenticated;
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own ON public.notifications
    FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;
COMMIT;
