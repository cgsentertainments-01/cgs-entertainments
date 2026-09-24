-- =============================================================================
-- CGS ENTERTAINMENTS - CERTIFICATE MANAGEMENT SYSTEM REDESIGN MIGRATION
-- =============================================================================

-- 1. ADD MISSING COLUMNS TO CERTIFICATES TABLE SAFELY
DO $$
BEGIN
    -- Round reference for multi-round events
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='round_id') THEN
        ALTER TABLE public.certificates ADD COLUMN round_id UUID REFERENCES public.competition_rounds(id) ON DELETE SET NULL;
    END IF;

    -- Audit & History timeline (JSONB Array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='history') THEN
        ALTER TABLE public.certificates ADD COLUMN history JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;

    -- Template reference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='template_id') THEN
        ALTER TABLE public.certificates ADD COLUMN template_id UUID;
    END IF;

    -- Reissue reason
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='revoke_reason') THEN
        ALTER TABLE public.certificates ADD COLUMN revoke_reason TEXT;
    END IF;

    -- Parent certificate ID for reissued certificates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='reissued_from_id') THEN
        ALTER TABLE public.certificates ADD COLUMN reissued_from_id UUID REFERENCES public.certificates(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. UPDATE CHECK CONSTRAINT ON CERTIFICATE STATUS TO SUPPORT ('draft', 'pending', 'issued', 'revoked')
DO $$
BEGIN
    -- Drop existing status check constraint if present
    ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_status_check;
    
    -- Add updated status check constraint
    ALTER TABLE public.certificates ADD CONSTRAINT certificates_status_check 
        CHECK (status IN ('draft', 'pending', 'issued', 'revoked', 'generated'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. CERTIFICATE TEMPLATES TABLE ENHANCEMENTS
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    certificate_type TEXT NOT NULL DEFAULT 'winner',
    background_url TEXT NOT NULL,
    orientation TEXT NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    text_elements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificate_templates' AND column_name='is_default') THEN
        ALTER TABLE public.certificate_templates ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificate_templates' AND column_name='text_elements') THEN
        ALTER TABLE public.certificate_templates ADD COLUMN text_elements JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_round_id ON public.certificates(round_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificate_templates_is_default ON public.certificate_templates(is_default);

-- Enable RLS on certificate_templates
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active templates" ON public.certificate_templates;
DROP POLICY IF EXISTS "Admins manage certificate_templates" ON public.certificate_templates;

CREATE POLICY "Public read active templates" ON public.certificate_templates
    FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins manage certificate_templates" ON public.certificate_templates
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
