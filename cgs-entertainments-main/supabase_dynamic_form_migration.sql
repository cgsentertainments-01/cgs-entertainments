-- =============================================================================
-- CGS ENTERTAINMENTS - DYNAMIC REGISTRATION FORM CONFIGURATION MIGRATION
-- =============================================================================
-- Target Database: Supabase PostgreSQL
-- Purpose: Adds form_config JSONB column to public.events table
-- =============================================================================

ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS form_config JSONB DEFAULT NULL;

COMMENT ON COLUMN public.events.form_config IS 'Dynamic registration form configuration including basic fields, custom fields, participation types, team settings, and required documents.';

CREATE INDEX IF NOT EXISTS idx_events_form_config ON public.events USING gin (form_config);
