-- =============================================================================
-- CGS ENTERTAINMENTS - EVENTS TABLE EXPANDED COLUMNS MIGRATION
-- =============================================================================
-- Target Database: Supabase PostgreSQL
-- Purpose: Adds direct columns to public.events table for multi-competition,
--          rules, age ranges, team settings, schedules, judges, and SEO configs.
-- =============================================================================

ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS mobile_banner_image TEXT,
  ADD COLUMN IF NOT EXISTS rules_regulations TEXT,
  ADD COLUMN IF NOT EXISTS min_age INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_age INT DEFAULT 60,
  ADD COLUMN IF NOT EXISTS registration_type TEXT DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS max_team_size INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS allow_multiple_categories BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_form_type TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS participation_categories JSONB DEFAULT '["Solo", "Duo", "Group"]'::jsonb,
  ADD COLUMN IF NOT EXISTS dance_styles JSONB DEFAULT '["Classical", "Hip Hop", "Western"]'::jsonb,
  ADD COLUMN IF NOT EXISTS required_documents JSONB DEFAULT '["Profile Photo", "ID Proof", "Dance Video"]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS refund_policy TEXT,
  ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS judges JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS homepage_settings JSONB DEFAULT '{}'::jsonb;

-- Comments on new columns
COMMENT ON COLUMN public.events.mobile_banner_image IS 'Mobile responsive banner image URL';
COMMENT ON COLUMN public.events.rules_regulations IS 'Event performance rules and competition regulations text';
COMMENT ON COLUMN public.events.min_age IS 'Minimum allowed age for participants';
COMMENT ON COLUMN public.events.max_age IS 'Maximum allowed age for participants';
COMMENT ON COLUMN public.events.participation_categories IS 'Supported participation category titles (Solo, Duo, Group, Photo, etc.)';
COMMENT ON COLUMN public.events.schedule IS 'Structured event schedule agenda timeline';
COMMENT ON COLUMN public.events.judges IS 'Assigned celebrity judges and guest profiles';
COMMENT ON COLUMN public.events.contact_info IS 'Official event coordinator contact details';

-- Create JSONB GIN Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_events_participation_cats ON public.events USING gin (participation_categories);
CREATE INDEX IF NOT EXISTS idx_events_dance_styles ON public.events USING gin (dance_styles);
