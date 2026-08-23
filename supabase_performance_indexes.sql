-- =============================================================================
-- CGS ENTERTAINMENTS - HIGH PERFORMANCE POSTGRESQL DATABASE INDEXES
-- =============================================================================
-- Execute this migration script in the Supabase SQL Editor to accelerate
-- API responses, admin table queries, registration lookups, and report generation.
-- =============================================================================

-- 1. REGISTRATION COMPOSITE & SORTING INDEXES
CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON public.registrations(event_id, registration_status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_participant_event ON public.registrations(participant_id, event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at_desc ON public.registrations(created_at DESC);

-- 2. EVENTS COMPOSITE PUBLISHED & DATE INDEXES
CREATE INDEX IF NOT EXISTS idx_events_status_published_date ON public.events(status, is_published, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_category_published ON public.events(category_id, is_published);

-- 3. PARTICIPANTS SEARCH INDEXES
CREATE INDEX IF NOT EXISTS idx_participants_email_phone ON public.participants(email, phone);
CREATE INDEX IF NOT EXISTS idx_participants_created_at_desc ON public.participants(created_at DESC);

-- 4. CERTIFICATES EVENT & PARTICIPANT INDEXES
CREATE INDEX IF NOT EXISTS idx_certificates_event_participant ON public.certificates(event_id, participant_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status_created ON public.certificates(status, created_at DESC);

-- 5. ADMINS AUTH & ROLE COMPOSITE INDEX
CREATE INDEX IF NOT EXISTS idx_admins_auth_active ON public.admins(auth_user_id, is_active);

-- 6. NOTIFICATIONS UNREAD & RECENT INDEX
CREATE INDEX IF NOT EXISTS idx_notifications_admin_unread ON public.notifications(admin_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at_desc ON public.notifications(created_at DESC);

-- 7. GUESTS & JUDGES ACTIVE ORDERING INDEX
CREATE INDEX IF NOT EXISTS idx_guests_judges_active_order ON public.guests_judges(is_active, display_order ASC, created_at DESC);

-- 8. BANNERS ACTIVE ORDERING INDEX
CREATE INDEX IF NOT EXISTS idx_banners_active_type_order ON public.banners(is_active, banner_type, display_order ASC);
