-- =============================================================================
-- CGS ENTERTAINMENTS - ADMIN NOTIFICATIONS MIGRATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.admins(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'system',
    reference_type TEXT,
    reference_id UUID,
    entity_type TEXT,
    entity_id UUID,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    deduplicate_key TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='recipient_id') THEN
        ALTER TABLE public.notifications ADD COLUMN recipient_id UUID REFERENCES public.admins(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='entity_type') THEN
        ALTER TABLE public.notifications ADD COLUMN entity_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='entity_id') THEN
        ALTER TABLE public.notifications ADD COLUMN entity_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='link_url') THEN
        ALTER TABLE public.notifications ADD COLUMN link_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='read_at') THEN
        ALTER TABLE public.notifications ADD COLUMN read_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='deduplicate_key') THEN
        ALTER TABLE public.notifications ADD COLUMN deduplicate_key TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='metadata') THEN
        ALTER TABLE public.notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

UPDATE public.notifications SET recipient_id = admin_id WHERE recipient_id IS NULL AND admin_id IS NOT NULL;
UPDATE public.notifications SET admin_id = recipient_id WHERE admin_id IS NULL AND recipient_id IS NOT NULL;
UPDATE public.notifications SET entity_type = reference_type WHERE entity_type IS NULL AND reference_type IS NOT NULL;
UPDATE public.notifications SET entity_id = reference_id WHERE entity_id IS NULL AND reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON public.notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_dedup_key ON public.notifications(deduplicate_key);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;

CREATE POLICY "Admins manage notifications" ON public.notifications
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
