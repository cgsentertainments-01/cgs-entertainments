-- =============================================================================
-- CGS ENTERTAINMENTS - MULTI-ROUND COMPETITION & PARTICIPANT PROMOTION SCHEMA
-- =============================================================================

-- 1. COMPETITION ROUNDS TABLE
CREATE TABLE IF NOT EXISTS public.competition_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    round_number INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('draft', 'active', 'upcoming', 'completed')),
    round_date TIMESTAMPTZ,
    fee NUMERIC(10, 2) DEFAULT 0.00 CHECK (fee >= 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    CONSTRAINT unique_event_round_number UNIQUE (event_id, round_number)
);

COMMENT ON TABLE public.competition_rounds IS 'Competition rounds configured for multi-round events.';

-- Indexes for Competition Rounds
CREATE INDEX IF NOT EXISTS idx_competition_rounds_event_id ON public.competition_rounds(event_id);
CREATE INDEX IF NOT EXISTS idx_competition_rounds_status ON public.competition_rounds(status);
CREATE INDEX IF NOT EXISTS idx_competition_rounds_round_number ON public.competition_rounds(round_number);

-- 2. COMPETITION ROUND PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.competition_round_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES public.competition_rounds(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'eliminated', 'withdrawn', 'winner', 'runner_up', 'finalist')),
    result_notes TEXT,
    promoted_at TIMESTAMPTZ DEFAULT statement_timestamp(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    CONSTRAINT unique_round_registration UNIQUE (round_id, registration_id)
);

COMMENT ON TABLE public.competition_round_participants IS 'Participant progression entries for each competition round.';

-- Indexes for Competition Round Participants
CREATE INDEX IF NOT EXISTS idx_comp_round_parts_round_id ON public.competition_round_participants(round_id);
CREATE INDEX IF NOT EXISTS idx_comp_round_parts_reg_id ON public.competition_round_participants(registration_id);
CREATE INDEX IF NOT EXISTS idx_comp_round_parts_status ON public.competition_round_participants(status);

-- 3. TRIGGERS FOR UPDATED_AT
CREATE TRIGGER trg_competition_rounds_updated_at
BEFORE UPDATE ON public.competition_rounds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_comp_round_parts_updated_at
BEFORE UPDATE ON public.competition_round_participants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.competition_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_round_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read competition_rounds" ON public.competition_rounds;
DROP POLICY IF EXISTS "Admins full management competition_rounds" ON public.competition_rounds;
DROP POLICY IF EXISTS "Public read competition_round_participants" ON public.competition_round_participants;
DROP POLICY IF EXISTS "Admins full management competition_round_participants" ON public.competition_round_participants;

-- Policies for competition_rounds
CREATE POLICY "Public read competition_rounds" ON public.competition_rounds
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins full management competition_rounds" ON public.competition_rounds
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for competition_round_participants
CREATE POLICY "Public read competition_round_participants" ON public.competition_round_participants
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins full management competition_round_participants" ON public.competition_round_participants
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
