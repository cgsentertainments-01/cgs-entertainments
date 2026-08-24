-- =============================================================================
-- CGS ENTERTAINMENTS - PHASE 1 REGISTRATION SYSTEM FIX MIGRATION
-- =============================================================================
-- Target Database: Supabase PostgreSQL
-- Purpose: Adds structured columns to public.registrations table to ensure
--          pre-payment pending registration records preserve participation types,
--          team details, custom fields, form snapshots, and participant details.
-- =============================================================================

ALTER TABLE public.registrations 
  ADD COLUMN IF NOT EXISTS participation_type TEXT,
  ADD COLUMN IF NOT EXISTS team_name TEXT,
  ADD COLUMN IF NOT EXISTS team_leader TEXT,
  ADD COLUMN IF NOT EXISTS team_contact TEXT,
  ADD COLUMN IF NOT EXISTS participant_count INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS form_config_snapshot JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS additional_participants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS document_urls JSONB DEFAULT '{}'::jsonb;

-- Indexes for performance & reporting queries
CREATE INDEX IF NOT EXISTS idx_registrations_participation_type ON public.registrations(participation_type);
CREATE INDEX IF NOT EXISTS idx_registrations_team_name ON public.registrations(team_name);

COMMENT ON COLUMN public.registrations.participation_type IS 'Structured participation option name (e.g. Solo, Duo, Trio, Group, Band)';
COMMENT ON COLUMN public.registrations.team_name IS 'Team or Group Name for multi-participant registrations';
COMMENT ON COLUMN public.registrations.team_leader IS 'Team leader full name';
COMMENT ON COLUMN public.registrations.participant_count IS 'Total participant count under this registration';
COMMENT ON COLUMN public.registrations.custom_fields IS 'JSONB object of key-value user inputs for custom event fields';
COMMENT ON COLUMN public.registrations.form_config_snapshot IS 'Snapshot of event form_config at the time of registration creation';
COMMENT ON COLUMN public.registrations.additional_participants IS 'JSONB array of additional team/group member details';
COMMENT ON COLUMN public.registrations.document_urls IS 'JSONB object mapping document IDs to uploaded file URLs';
