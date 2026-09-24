-- =============================================================================
-- CGS ENTERTAINMENTS - WINNER SELECTION, NOTIFICATIONS & MESSAGING SCHEMA
-- =============================================================================

-- 1. EVENT RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.event_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    result_type TEXT NOT NULL DEFAULT 'pending' CHECK (result_type IN ('winner', 'runner_up', 'finalist', 'special_mention', 'participant', 'pending')),
    position INT DEFAULT 99,
    selected_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    selected_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    notify_sent BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    CONSTRAINT unique_event_participant_result UNIQUE (event_id, participant_id)
);

COMMENT ON TABLE public.event_results IS 'Contest winner and performance results selected by administrators.';

-- Indexes for Event Results
CREATE INDEX IF NOT EXISTS idx_event_results_event_id ON public.event_results(event_id);
CREATE INDEX IF NOT EXISTS idx_event_results_participant_id ON public.event_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_event_results_result_type ON public.event_results(result_type);

-- 2. NOTIFICATIONS TABLE (FOR BOTH USERS AND ADMINS)
-- If notifications table already exists, alter/add missing columns safely
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'system' CHECK (notification_type IN ('result', 'message', 'registration', 'payment', 'contact', 'certificate', 'event', 'system')),
    reference_type TEXT,
    reference_id UUID,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.notifications IS 'User and admin notifications table.';

-- Ensure user_id, participant_id, event_id, link_url exist if table was pre-existing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_id') THEN
        ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='participant_id') THEN
        ALTER TABLE public.notifications ADD COLUMN participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='event_id') THEN
        ALTER TABLE public.notifications ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='link_url') THEN
        ALTER TABLE public.notifications ADD COLUMN link_url TEXT;
    END IF;
END $$;

-- Indexes for Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_participant_id ON public.notifications(participant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_event_id ON public.notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- 3. MESSAGES TABLE (ADMIN TO PARTICIPANT MESSAGING)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.messages IS 'Direct messages sent by administrators to event participants.';

-- Indexes for Messages
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_participant_id ON public.messages(participant_id);
CREATE INDEX IF NOT EXISTS idx_messages_event_id ON public.messages(event_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read event_results" ON public.event_results;
DROP POLICY IF EXISTS "Admins full management event_results" ON public.event_results;
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins full management notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users read own messages" ON public.messages;
DROP POLICY IF EXISTS "Admins full management messages" ON public.messages;

-- Policies for event_results
CREATE POLICY "Public read event_results" ON public.event_results
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins full management event_results" ON public.event_results
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for notifications
CREATE POLICY "Users read own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (
        user_id = auth.uid() 
        OR admin_id = auth.uid()
        OR participant_id IN (
            SELECT id FROM public.participants WHERE LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
        )
    );

CREATE POLICY "Admins full management notifications" ON public.notifications
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for messages
CREATE POLICY "Users read own messages" ON public.messages
    FOR SELECT TO authenticated USING (
        recipient_id = auth.uid()
        OR participant_id IN (
            SELECT id FROM public.participants WHERE LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
        )
    );

CREATE POLICY "Admins full management messages" ON public.messages
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
