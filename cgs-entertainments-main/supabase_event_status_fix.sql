-- =============================================================================
-- CGS ENTERTAINMENTS - EVENT STATUS & COMPLETED COLUMN MIGRATION
-- =============================================================================
-- Purpose: 
-- 1. Adds 'completed' boolean column with default false.
-- 2. Updates status check constraint to include 'upcoming' and 'completed'.
-- 3. Backfills existing records safely without deleting any data.
-- =============================================================================

-- 1. Add completed and is_completed boolean columns if missing
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- 2. Drop legacy status check constraint if exists
ALTER TABLE public.events 
  DROP CONSTRAINT IF EXISTS events_status_check;

-- 3. Add updated status check constraint allowing all canonical statuses
ALTER TABLE public.events 
  ADD CONSTRAINT events_status_check 
  CHECK (status IN ('draft', 'upcoming', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'));

-- 4. Backfill existing null completed values safely
UPDATE public.events 
  SET completed = false, is_completed = false 
  WHERE completed IS NULL OR is_completed IS NULL;

-- 5. Backfill upcoming events status if event_type is upcoming
UPDATE public.events 
  SET status = 'upcoming' 
  WHERE (event_type = 'upcoming' OR status = 'coming_soon') AND status != 'completed';

-- 6. Reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
