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
