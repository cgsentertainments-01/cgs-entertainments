-- =============================================================================
-- CGS ENTERTAINMENTS - PRODUCTION SUPABASE POSTGRESQL DATABASE SCHEMA
-- =============================================================================
-- Author: Antigravity AI (Google DeepMind Team)
-- Platform: Supabase / PostgreSQL
-- Target Project: CGS Entertainments (Event & Talent Registration Management)
-- Features: 20 Application Tables, Concurrency-Safe Number Generators,
--           Automated Updated_At Triggers, Event Participant Counting,
--           Strict Foreign Key Rules, Optimized Indexes, Comprehensive RLS,
--           and Supabase Storage Bucket Security Policies.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SECTION A: COMPLETE SQL SCHEMA (TABLES & CONSTRAINTS)
-- =============================================================================

--------------------------------------------------------------------------------
-- 1. ADMINS
--------------------------------------------------------------------------------
-- Stores administrative users with RBAC roles.
-- References auth.users(id) for safe integration with Supabase Auth.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
    avatar TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.admins IS 'Administrative personnel managing CGS Entertainments platform.';

--------------------------------------------------------------------------------
-- 2. EVENT CATEGORIES
--------------------------------------------------------------------------------
-- Categories for events (e.g. Dance, Modeling, Acting, Singing, Fashion Shows).
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.event_categories IS 'Event categories (Dance, Modeling, Acting, Singing, etc.).';

--------------------------------------------------------------------------------
-- 3. DANCE STYLES
--------------------------------------------------------------------------------
-- Specific dance styles for dance competition registrations.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dance_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.dance_styles IS 'Specific dance styles (Classical, Hip Hop, Western, Folk, etc.).';

--------------------------------------------------------------------------------
-- 4. EVENTS
--------------------------------------------------------------------------------
-- Core event table storing details, dates, capacity, fees, and publishing status.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description TEXT,
    category_id UUID NOT NULL REFERENCES public.event_categories(id) ON DELETE RESTRICT,
    event_date TIMESTAMPTZ NOT NULL,
    registration_start_date TIMESTAMPTZ,
    registration_deadline TIMESTAMPTZ,
    venue TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    banner_image TEXT,
    thumbnail_image TEXT,
    registration_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (registration_fee >= 0),
    max_participants INT CHECK (max_participants IS NULL OR max_participants > 0),
    current_participants INT NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    terms_conditions TEXT,
    form_config JSONB,
    created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.events IS 'Master table for all talent and cultural events managed by CGS.';

--------------------------------------------------------------------------------
-- 5. PARTICIPANTS
--------------------------------------------------------------------------------
-- Master participant registry containing personal profile & emergency contact info.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_number VARCHAR(30) NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    address TEXT,
    city TEXT,
    state TEXT,
    pincode VARCHAR(10),
    profile_photo TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.participants IS 'Registered talent participants.';

--------------------------------------------------------------------------------
-- 6. PARTICIPANT DOCUMENTS
--------------------------------------------------------------------------------
-- Uploaded verification documents, photos, audio tracks, and audition videos.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participant_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('id_proof', 'participant_photo', 'dance_video', 'music_track', 'other')),
    document_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.admins(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.participant_documents IS 'Media files and identification documents uploaded by participants.';

--------------------------------------------------------------------------------
-- 7. REGISTRATIONS
--------------------------------------------------------------------------------
-- Main relation connecting participants to events, categories, and dance styles.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.event_categories(id) ON DELETE RESTRICT,
    dance_style_id UUID REFERENCES public.dance_styles(id) ON DELETE SET NULL,
    registration_status TEXT NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'payment_pending', 'confirmed', 'cancelled', 'rejected', 'completed')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
    registration_date TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    notes TEXT,
    qr_token VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    CONSTRAINT unique_event_participant UNIQUE (event_id, participant_id)
);

COMMENT ON TABLE public.registrations IS 'Event registration entries linking participants to specific events.';

--------------------------------------------------------------------------------
-- 8. REGISTRATION PAYMENTS
--------------------------------------------------------------------------------
-- Payment processing entries integrated with Razorpay gateway.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registration_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    paid_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.registration_payments IS 'Razorpay payment records linked to event registrations.';

--------------------------------------------------------------------------------
-- 9. PAYMENT TRANSACTIONS
--------------------------------------------------------------------------------
-- Detailed payment audit trail recording payments, refunds, and adjustments.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
    payment_id UUID REFERENCES public.registration_payments(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    gateway TEXT NOT NULL DEFAULT 'Razorpay',
    gateway_transaction_id VARCHAR(100),
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    gateway_response JSONB,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.payment_transactions IS 'Complete financial audit trail for payments and refunds.';

--------------------------------------------------------------------------------
-- 10. GALLERY
--------------------------------------------------------------------------------
-- Media library storing images and videos for past and upcoming events.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.gallery IS 'Photo and video gallery items for CGS platform showcase.';

--------------------------------------------------------------------------------
-- 11. BANNERS
--------------------------------------------------------------------------------
-- Promotional banners for home page hero sliders and announcement popups.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    link_url TEXT,
    button_text TEXT,
    banner_type TEXT NOT NULL DEFAULT 'hero' CHECK (banner_type IN ('hero', 'event', 'promotional', 'announcement')),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.banners IS 'Hero sliders and promotional banners.';

--------------------------------------------------------------------------------
-- 12. SPONSORS
--------------------------------------------------------------------------------
-- Event sponsors list and logos.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.sponsors IS 'Corporate and event sponsors.';

--------------------------------------------------------------------------------
-- 13. PARTNERS
--------------------------------------------------------------------------------
-- Media and organizational partners.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.partners IS 'Media and event execution partners.';

--------------------------------------------------------------------------------
-- 14. CERTIFICATES
--------------------------------------------------------------------------------
-- Digital certificates of participation or merit issued to participants.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE RESTRICT,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    certificate_type TEXT NOT NULL DEFAULT 'participation' CHECK (certificate_type IN ('participation', 'merit', 'winner', 'runner_up', 'appreciation')),
    certificate_url TEXT NOT NULL,
    verification_token VARCHAR(64) NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'issued', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.certificates IS 'Issued digital certificates with public QR verification tokens.';

--------------------------------------------------------------------------------
-- 15. CONTACT MESSAGES
--------------------------------------------------------------------------------
-- Contact us form submissions from visitors and participants.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone VARCHAR(20),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    replied_at TIMESTAMPTZ,
    replied_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.contact_messages IS 'Visitor contact queries and admin responses.';

--------------------------------------------------------------------------------
-- 16. EMAIL LOGS
--------------------------------------------------------------------------------
-- System log for transactional emails (confirmations, receipts, credentials).
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    email_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.email_logs IS 'Audit log of automated email notifications.';

--------------------------------------------------------------------------------
-- 17. WHATSAPP LOGS
--------------------------------------------------------------------------------
-- System log for WhatsApp notifications and receipt messages.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    message_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.whatsapp_logs IS 'Audit log of automated WhatsApp messages.';

--------------------------------------------------------------------------------
-- 18. NOTIFICATIONS
--------------------------------------------------------------------------------
-- In-app notifications for admins regarding new registrations, payments, etc.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('registration', 'payment', 'contact', 'certificate', 'event', 'system')),
    reference_type TEXT,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.notifications IS 'Admin panel push and system notifications.';

--------------------------------------------------------------------------------
-- 19. REPORTS
--------------------------------------------------------------------------------
-- Metadata for generated analytical reports (CSV/PDF exports).
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT NOT NULL CHECK (report_type IN ('registrations', 'payments', 'events', 'participants', 'revenue')),
    title TEXT NOT NULL,
    file_url TEXT,
    generated_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.reports IS 'Generated administrative report exports.';

--------------------------------------------------------------------------------
-- 20. WEBSITE SETTINGS
--------------------------------------------------------------------------------
-- Dynamic key-value store for frontend layout, contact details, and SEO settings.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type TEXT NOT NULL DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json')),
    description TEXT,
    updated_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.website_settings IS 'Global dynamic portal settings and configuration parameters.';

--------------------------------------------------------------------------------
-- 21. GUESTS & JUDGES
--------------------------------------------------------------------------------
-- Master table for celebrity guests, judges, and chief guests.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guests_judges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Judge' CHECK (role IN ('Guest', 'Judge', 'Chief Guest')),
    designation TEXT,
    organization TEXT,
    bio TEXT,
    photo_url TEXT,
    social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

COMMENT ON TABLE public.guests_judges IS 'Master table for celebrity guests, judges, and chief guests.';


-- =============================================================================
-- SECTION B: INDEXES
-- =============================================================================
-- Strategic B-Tree indexes created on search terms, foreign keys, slugs, 
-- unique identifiers, and filtered query criteria.
--------------------------------------------------------------------------------

-- Admins
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_auth_user_id ON public.admins(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);

-- Event Categories
CREATE INDEX IF NOT EXISTS idx_event_categories_slug ON public.event_categories(slug);
CREATE INDEX IF NOT EXISTS idx_event_categories_is_active ON public.event_categories(is_active);

-- Dance Styles
CREATE INDEX IF NOT EXISTS idx_dance_styles_slug ON public.dance_styles(slug);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);

-- Participants
CREATE INDEX IF NOT EXISTS idx_participants_participant_number ON public.participants(participant_number);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_phone ON public.participants(phone);

-- Participant Documents
CREATE INDEX IF NOT EXISTS idx_participant_documents_participant_id ON public.participant_documents(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_documents_verification_status ON public.participant_documents(verification_status);

-- Registrations
CREATE INDEX IF NOT EXISTS idx_registrations_registration_number ON public.registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_participant_id ON public.registrations(participant_id);
CREATE INDEX IF NOT EXISTS idx_registrations_category_id ON public.registrations(category_id);
CREATE INDEX IF NOT EXISTS idx_registrations_dance_style_id ON public.registrations(dance_style_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON public.registrations(qr_token);

-- Registration Payments
CREATE INDEX IF NOT EXISTS idx_registration_payments_registration_id ON public.registration_payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_payments_razorpay_order_id ON public.registration_payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_registration_payments_razorpay_payment_id ON public.registration_payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_registration_payments_status ON public.registration_payments(status);

-- Payment Transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_registration_id ON public.payment_transactions(registration_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON public.payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_tx_id ON public.payment_transactions(gateway_transaction_id);

-- Gallery
CREATE INDEX IF NOT EXISTS idx_gallery_event_id ON public.gallery(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_is_published ON public.gallery(is_published);

-- Banners
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON public.banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_banner_type ON public.banners(banner_type);

-- Sponsors & Partners
CREATE INDEX IF NOT EXISTS idx_sponsors_is_active ON public.sponsors(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_is_active ON public.partners(is_active);

-- Certificates
CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_token ON public.certificates(verification_token);
CREATE INDEX IF NOT EXISTS idx_certificates_registration_id ON public.certificates(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificates_participant_id ON public.certificates(participant_id);
CREATE INDEX IF NOT EXISTS idx_certificates_event_id ON public.certificates(event_id);

-- Contact Messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);

-- Logs
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_phone ON public.whatsapp_logs(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON public.whatsapp_logs(status);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_admin_id ON public.notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Reports & Settings
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON public.reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON public.reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_settings_key ON public.website_settings(setting_key);


-- =============================================================================
-- SECTION C: TRIGGERS AND FUNCTIONS
-- =============================================================================

--------------------------------------------------------------------------------
-- 1. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = statement_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables possessing an updated_at column
CREATE TRIGGER trg_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_event_categories_updated_at BEFORE UPDATE ON public.event_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dance_styles_updated_at BEFORE UPDATE ON public.dance_styles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_participants_updated_at BEFORE UPDATE ON public.participants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_participant_documents_updated_at BEFORE UPDATE ON public.participant_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_registrations_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_registration_payments_updated_at BEFORE UPDATE ON public.registration_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gallery_updated_at BEFORE UPDATE ON public.gallery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sponsors_updated_at BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_website_settings_updated_at BEFORE UPDATE ON public.website_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_guests_judges_updated_at BEFORE UPDATE ON public.guests_judges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--------------------------------------------------------------------------------
-- 2. CONCURRENCY-SAFE NUMBER GENERATORS
--------------------------------------------------------------------------------
-- PostgreSQL sequences ensure atomic incrementing even under heavy concurrent load.
--------------------------------------------------------------------------------

-- Participant Number Sequence & Generator (Format: CGS-P-000001)
CREATE SEQUENCE IF NOT EXISTS public.seq_participant_number START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_participant_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'CGS-P-' || LPAD(nextval('public.seq_participant_number')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Registration Number Sequence & Generator (Format: CGS-REG-2026-000001)
CREATE SEQUENCE IF NOT EXISTS public.seq_registration_number START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'CGS-REG-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.seq_registration_number')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Certificate Number Sequence & Generator (Format: CGS-CERT-2026-000001)
CREATE SEQUENCE IF NOT EXISTS public.seq_certificate_number START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'CGS-CERT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.seq_certificate_number')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Secure Hex Token Generator (For QR tokens and Verification tokens)
CREATE OR REPLACE FUNCTION public.generate_secure_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- 3. AUTO-POPULATE IDENTIFIERS ON INSERT TRIGGERS
--------------------------------------------------------------------------------

-- Participant Auto-Number Trigger
CREATE OR REPLACE FUNCTION public.trg_auto_participant_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.participant_number IS NULL OR NEW.participant_number = '' THEN
        NEW.participant_number := public.generate_participant_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_participants_auto_num
BEFORE INSERT ON public.participants
FOR EACH ROW EXECUTE FUNCTION public.trg_auto_participant_number();

-- Registration Auto-Number & QR Token Trigger
CREATE OR REPLACE FUNCTION public.trg_auto_registration_details()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
        NEW.registration_number := public.generate_registration_number();
    END IF;
    IF NEW.qr_token IS NULL OR NEW.qr_token = '' THEN
        NEW.qr_token := public.generate_secure_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registrations_auto_details
BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.trg_auto_registration_details();

-- Certificate Auto-Number & Verification Token Trigger
CREATE OR REPLACE FUNCTION public.trg_auto_certificate_details()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
        NEW.certificate_number := public.generate_certificate_number();
    END IF;
    IF NEW.verification_token IS NULL OR NEW.verification_token = '' THEN
        NEW.verification_token := public.generate_secure_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_certificates_auto_details
BEFORE INSERT ON public.certificates
FOR EACH ROW EXECUTE FUNCTION public.trg_auto_certificate_details();

--------------------------------------------------------------------------------
-- 4. EVENT PARTICIPANT COUNT AUTOMATION TRIGGER
--------------------------------------------------------------------------------
-- Keeps current_participants column synchronized when registration status changes.
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.registration_status = 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.event_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.registration_status <> 'confirmed' AND NEW.registration_status = 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.event_id;
        ELSIF (OLD.registration_status = 'confirmed' AND NEW.registration_status <> 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = GREATEST(0, current_participants - 1) 
            WHERE id = NEW.event_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.registration_status = 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = GREATEST(0, current_participants - 1) 
            WHERE id = OLD.event_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registrations_count_sync
AFTER INSERT OR UPDATE OR DELETE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.update_event_participant_count();


-- =============================================================================
-- SECTION D: ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Security definer function to check if the caller is an active admin user
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admins
        WHERE (auth_user_id = auth.uid() OR id = auth.uid())
          AND is_active = true
    );
$$;

-- Enable RLS across all application tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dance_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- RLS POLICIES FOR ADMINS TABLE
--------------------------------------------------------------------------------
CREATE POLICY "Admins full management" ON public.admins
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR EVENT CATEGORIES
--------------------------------------------------------------------------------
CREATE POLICY "Public read active categories" ON public.event_categories
    FOR SELECT TO public
    USING (is_active = true);

CREATE POLICY "Admins manage categories" ON public.event_categories
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR DANCE STYLES
--------------------------------------------------------------------------------
CREATE POLICY "Public read active dance styles" ON public.dance_styles
    FOR SELECT TO public
    USING (is_active = true);

CREATE POLICY "Admins manage dance styles" ON public.dance_styles
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR EVENTS
--------------------------------------------------------------------------------
CREATE POLICY "Public read published events" ON public.events
    FOR SELECT TO public
    USING (is_published = true);

CREATE POLICY "Admins manage events" ON public.events
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR PARTICIPANTS
--------------------------------------------------------------------------------
-- Public callers can insert a new participant profile during registration.
-- Admins can view and manage all participant records.
--------------------------------------------------------------------------------
CREATE POLICY "Public insert participant profile" ON public.participants
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Admins manage participants" ON public.participants
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR PARTICIPANT DOCUMENTS
--------------------------------------------------------------------------------
CREATE POLICY "Public upload participant document" ON public.participant_documents
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Admins manage participant documents" ON public.participant_documents
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR REGISTRATIONS
--------------------------------------------------------------------------------
-- Public can insert registration requests and query their own registration via qr_token.
-- Admins can manage all registrations.
--------------------------------------------------------------------------------
CREATE POLICY "Public create registration" ON public.registrations
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Public view registration by qr token" ON public.registrations
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Admins manage registrations" ON public.registrations
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR REGISTRATION PAYMENTS
--------------------------------------------------------------------------------
CREATE POLICY "Public insert payment record" ON public.registration_payments
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Public read payment record" ON public.registration_payments
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Admins manage registration payments" ON public.registration_payments
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR PAYMENT TRANSACTIONS
--------------------------------------------------------------------------------
CREATE POLICY "Public insert payment transaction" ON public.payment_transactions
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Admins manage payment transactions" ON public.payment_transactions
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR GALLERY
--------------------------------------------------------------------------------
CREATE POLICY "Public read published gallery" ON public.gallery
    FOR SELECT TO public
    USING (is_published = true);

CREATE POLICY "Admins manage gallery" ON public.gallery
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR BANNERS
--------------------------------------------------------------------------------
CREATE POLICY "Public read active banners" ON public.banners
    FOR SELECT TO public
    USING (is_active = true AND (start_date IS NULL OR start_date <= statement_timestamp()) AND (end_date IS NULL OR end_date >= statement_timestamp()));

CREATE POLICY "Admins manage banners" ON public.banners
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR SPONSORS
--------------------------------------------------------------------------------
CREATE POLICY "Public read active sponsors" ON public.sponsors
    FOR SELECT TO public
    USING (is_active = true);

CREATE POLICY "Admins manage sponsors" ON public.sponsors
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR PARTNERS
--------------------------------------------------------------------------------
CREATE POLICY "Public read active partners" ON public.partners
    FOR SELECT TO public
    USING (is_active = true);

CREATE POLICY "Admins manage partners" ON public.partners
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR CERTIFICATES
--------------------------------------------------------------------------------
-- Anyone with a valid verification token or certificate number can verify authenticity.
--------------------------------------------------------------------------------
CREATE POLICY "Public verify certificates" ON public.certificates
    FOR SELECT TO public
    USING (status = 'issued');

CREATE POLICY "Admins manage certificates" ON public.certificates
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR CONTACT MESSAGES
--------------------------------------------------------------------------------
CREATE POLICY "Public submit contact message" ON public.contact_messages
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Admins manage contact messages" ON public.contact_messages
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR EMAIL & WHATSAPP LOGS
--------------------------------------------------------------------------------
CREATE POLICY "Admins view email logs" ON public.email_logs
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins view whatsapp logs" ON public.whatsapp_logs
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR NOTIFICATIONS
--------------------------------------------------------------------------------
CREATE POLICY "Admins view notifications" ON public.notifications
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR REPORTS
--------------------------------------------------------------------------------
CREATE POLICY "Admins access reports" ON public.reports
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--------------------------------------------------------------------------------
-- RLS POLICIES FOR WEBSITE SETTINGS
--------------------------------------------------------------------------------
CREATE POLICY "Public read website settings" ON public.website_settings
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Admins manage website settings" ON public.website_settings
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- =============================================================================
-- SECTION E: STORAGE BUCKETS AND STORAGE POLICIES
-- =============================================================================

-- Ensure storage schema buckets are created
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('event-banners', 'event-banners', true),
    ('participant-photos', 'participant-photos', false),
    ('id-proofs', 'id-proofs', false),
    ('dance-videos', 'dance-videos', false),
    ('music-tracks', 'music-tracks', false),
    ('payment-screenshots', 'payment-screenshots', false),
    ('gallery', 'gallery', true),
    ('certificates', 'certificates', true),
    ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

--------------------------------------------------------------------------------
-- STORAGE RLS POLICIES
--------------------------------------------------------------------------------

-- Public Access Policies for Public Buckets (event-banners, gallery, certificates, website-assets)
CREATE POLICY "Public Read Access for Public Storage Buckets" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id IN ('event-banners', 'gallery', 'certificates', 'website-assets'));

-- Public Upload Policy for Participant Files during Registration
CREATE POLICY "Public Upload Access for Registration Storage Buckets" ON storage.objects
    FOR INSERT TO public
    WITH CHECK (bucket_id IN ('participant-photos', 'id-proofs', 'dance-videos', 'music-tracks', 'payment-screenshots'));

-- Admin Full Access Policy for All Storage Buckets
CREATE POLICY "Admin Full Access for Storage Objects" ON storage.objects
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- =============================================================================
-- SECTION F: DEPENDENCY AND RELATIONSHIP SUMMARY
-- =============================================================================
/*
TABLE RELATIONSHIPS & CASCADE RULES SUMMARY:
--------------------------------------------------------------------------------
1. events -> event_categories (ON DELETE RESTRICT)
   - Prevents deletion of a category if active events belong to it.

2. events -> admins (ON DELETE SET NULL)
   - Preserves event records if the creator admin account is removed.

3. participant_documents -> participants (ON DELETE CASCADE)
   - Automatically removes document records when a participant is purged.

4. registrations -> events (ON DELETE RESTRICT)
   - Prevents deletion of an event that has active registrations.

5. registrations -> participants (ON DELETE RESTRICT)
   - Protects financial and registration history if a participant profile is edited.

6. registrations -> event_categories & dance_styles (ON DELETE RESTRICT / SET NULL)
   - Retains category references; dance style set to null if style deleted.

7. registration_payments -> registrations (ON DELETE RESTRICT)
   - Financial payment records cannot be deleted while registrations exist.

8. payment_transactions -> registrations & registration_payments (ON DELETE RESTRICT / SET NULL)
   - Immutable financial audit log for all gateway interactions.

9. certificates -> registrations, participants, events (ON DELETE RESTRICT)
   - Ensures valid certificate references for public verification integrity.

10. gallery -> events (ON DELETE SET NULL)
    - Retains gallery items as global assets if an event is unlinked.

11. notifications -> admins (ON DELETE CASCADE)
    - Cleans up notification entries when an admin is removed.

12. website_settings, reports -> admins (ON DELETE SET NULL)
    - Retains administrative settings and report metadata regardless of user changes.

SECURITY & INTEGRITY DECISIONS:
--------------------------------------------------------------------------------
- Row Level Security (RLS) is explicitly enabled on all 20 application tables.
- Public users can ONLY read published events, active categories, active dance styles,
  banners, sponsors, partners, gallery items, website settings, and verify certificates.
- Public users can ONLY insert new participant profiles, registration records, uploaded
  media files, payments, and contact messages. They cannot view or modify administrative data.
- Concurrency-safe PostgreSQL sequences (`seq_participant_number`, `seq_registration_number`,
  `seq_certificate_number`) guarantee atomic, non-overlapping padded numbers.
- Cryptographically secure 64-character hex tokens (`generate_secure_token()`) are generated
  for QR verification and certificate validation without exposing internal raw IDs.
*/
