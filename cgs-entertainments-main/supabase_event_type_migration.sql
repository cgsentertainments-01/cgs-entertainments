-- =============================================================================
-- CGS ENTERTAINMENTS - EVENT TYPE COLUMN MIGRATION
-- =============================================================================
-- Target Database: Supabase PostgreSQL
-- Purpose: Adds event_type column to public.events table to support 
--          two-type event flow ('published' vs 'upcoming').
-- =============================================================================

ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'published';

COMMENT ON COLUMN public.events.event_type IS 'Type of event: published (full registration-ready event) or upcoming (promotional announcement)';

-- Index for fast filtering by event_type
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
