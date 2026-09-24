-- =============================================================================
-- CGS ENTERTAINMENTS - OPTIONAL BANNER SCHEMA EXTENSION MIGRATION
-- =============================================================================
-- Execute this script in your Supabase SQL Editor if you wish to store extended
-- banner attributes like long description and target_blank (open link in new tab).
-- =============================================================================

-- Add extended columns if they do not already exist
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS target_blank BOOLEAN NOT NULL DEFAULT false;

-- Ensure indexes exist for optimized querying
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON public.banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON public.banners(display_order);
CREATE INDEX IF NOT EXISTS idx_banners_banner_type ON public.banners(banner_type);

-- Notify schema update complete
COMMENT ON COLUMN public.banners.description IS 'Detailed extended description for promotional banner.';
COMMENT ON COLUMN public.banners.target_blank IS 'Whether CTA link should open in a new browser tab.';
