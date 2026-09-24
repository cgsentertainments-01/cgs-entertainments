-- =============================================================================
-- CGS ENTERTAINMENTS - EVENT RESULTS TABLE FIX & ENHANCEMENT MIGRATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.event_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
    result_type TEXT NOT NULL DEFAULT 'pending',
    position INT DEFAULT 99,
    score NUMERIC(10,2) DEFAULT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    selected_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    selected_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    notify_sent BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    CONSTRAINT unique_event_participant_result UNIQUE (event_id, participant_id)
);

COMMENT ON TABLE public.event_results IS 'Contest winner and performance results selected by administrators.';

-- Safely add missing columns if table pre-existed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='event_results' AND column_name='score') THEN
        ALTER TABLE public.event_results ADD COLUMN score NUMERIC(10,2) DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='event_results' AND column_name='category_id') THEN
        ALTER TABLE public.event_results ADD COLUMN category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='event_results' AND column_name='registration_id') THEN
        ALTER TABLE public.event_results ADD COLUMN registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='event_results' AND column_name='is_published') THEN
        ALTER TABLE public.event_results ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Update check constraint on result_type
ALTER TABLE public.event_results DROP CONSTRAINT IF EXISTS event_results_result_type_check;
ALTER TABLE public.event_results ADD CONSTRAINT event_results_result_type_check
    CHECK (result_type IN ('winner', 'first_place', 'second_place', 'third_place', 'runner_up', 'finalist', 'special_mention', 'qualified', 'eliminated', 'participant', 'disqualified', 'pending'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_results_event_id ON public.event_results(event_id);
CREATE INDEX IF NOT EXISTS idx_event_results_participant_id ON public.event_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_event_results_category_id ON public.event_results(category_id);
CREATE INDEX IF NOT EXISTS idx_event_results_result_type ON public.event_results(result_type);

-- RLS Policies
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read event_results" ON public.event_results;
CREATE POLICY "Public read event_results" ON public.event_results FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins full management event_results" ON public.event_results;
CREATE POLICY "Admins full management event_results" ON public.event_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
