-- =============================================================================
-- CGS ENTERTAINMENTS - GUESTS & JUDGES MIGRATION
-- =============================================================================

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

-- Index for public queries
CREATE INDEX IF NOT EXISTS idx_guests_judges_is_active ON public.guests_judges(is_active);
CREATE INDEX IF NOT EXISTS idx_guests_judges_display_order ON public.guests_judges(display_order ASC);

-- Enable RLS
ALTER TABLE public.guests_judges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Read Active Guests Judges" ON public.guests_judges;
DROP POLICY IF EXISTS "Admin All Guests Judges" ON public.guests_judges;

-- Policies
CREATE POLICY "Public Read Active Guests Judges" ON public.guests_judges
    FOR SELECT USING (true);

CREATE POLICY "Admin All Guests Judges" ON public.guests_judges
    FOR ALL USING (true);

-- Updated_at Trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = statement_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guests_judges_updated_at ON public.guests_judges;
CREATE TRIGGER trg_guests_judges_updated_at
    BEFORE UPDATE ON public.guests_judges
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Default Data (Initial Celebrity Guests & Judges)
INSERT INTO public.guests_judges (name, role, designation, organization, bio, photo_url, social_links, display_order, is_active)
VALUES
(
    'Shiamak Davar',
    'Chief Guest',
    'International Choreographer',
    'Shiamak Davar Dance Academy',
    'Global pioneer of contemporary dance in India and legendary Bollywood choreographer.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    '{"instagram": "https://instagram.com", "youtube": "https://youtube.com"}'::jsonb,
    1,
    true
),
(
    'Punit Pathak',
    'Judge',
    'Renowned Choreographer & Actor',
    'Dance India Dance Winner',
    'Acclaimed choreographer and mentor known for path-breaking modern dance styles.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    '{"instagram": "https://instagram.com", "youtube": "https://youtube.com"}'::jsonb,
    2,
    true
),
(
    'Shakti Mohan',
    'Judge',
    'Celebrity Dancer & Mentor',
    'Nritya Shakti',
    'Popular contemporary dancer and mentor with international dance performance acclaim.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    '{"instagram": "https://instagram.com", "youtube": "https://youtube.com"}'::jsonb,
    3,
    true
),
(
    'Neeti Mohan',
    'Guest',
    'Playback Singer & Performing Artist',
    'Bollywood Music Industry',
    'Award-winning playback singer and celebrity judge across major Indian reality shows.',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    '{"instagram": "https://instagram.com", "youtube": "https://youtube.com"}'::jsonb,
    4,
    true
),
(
    'Terence Lewis',
    'Judge',
    'Choreographer & Dance Educator',
    'Terence Lewis Contemporary Dance Company',
    'Master of Indian contemporary and modern dance and prominent TV personality.',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    '{"instagram": "https://instagram.com", "youtube": "https://youtube.com"}'::jsonb,
    5,
    true
)
ON CONFLICT DO NOTHING;
