-- ====================================================================
-- SUPABASE MIGRATION: Add Missing Columns to Public Events Table
-- Run this query in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Add mobile_banner_image column if it doesn't exist
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS mobile_banner_image TEXT;

-- 2. Add event_type column if it doesn't exist ('published' | 'upcoming')
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'published' CHECK (event_type IN ('published', 'upcoming'));

-- 3. Add rules_regulations column if it doesn't exist
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS rules_regulations TEXT;

-- 4. Add terms_conditions column if it doesn't exist
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS terms_conditions TEXT;

-- 5. Add index on event_type for fast query performance
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);

-- 6. Reload PostgREST Schema Cache (forces Supabase to recognize the new columns immediately)
NOTIFY pgrst, 'reload schema';
