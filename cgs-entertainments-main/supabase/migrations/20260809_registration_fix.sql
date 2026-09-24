-- =============================================================================
-- CGS ENTERTAINMENTS - REGISTRATION SYSTEM FIX MIGRATION
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--------------------------------------------------------------------------------
-- 1. ENSURE RLS POLICIES FOR PARTICIPANTS & REGISTRATIONS
--------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registration_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_transactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Public insert policy for participants
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'participants' AND policyname = 'Public insert participant profile'
    ) THEN
        CREATE POLICY "Public insert participant profile" ON public.participants
            FOR INSERT TO public WITH CHECK (true);
    END IF;

    -- Public select policy for participants (finding by email/phone identifier)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'participants' AND policyname = 'Public select participants'
    ) THEN
        CREATE POLICY "Public select participants" ON public.participants
            FOR SELECT TO public USING (true);
    END IF;

    -- Public insert policy for registrations
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Public create registration'
    ) THEN
        CREATE POLICY "Public create registration" ON public.registrations
            FOR INSERT TO public WITH CHECK (true);
    END IF;

    -- Public select policy for registrations
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Public select registrations'
    ) THEN
        CREATE POLICY "Public select registrations" ON public.registrations
            FOR SELECT TO public USING (true);
    END IF;

    -- Public insert & select policy for payments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'registration_payments' AND policyname = 'Public insert payment record'
    ) THEN
        CREATE POLICY "Public insert payment record" ON public.registration_payments
            FOR INSERT TO public WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'registration_payments' AND policyname = 'Public read payment record'
    ) THEN
        CREATE POLICY "Public read payment record" ON public.registration_payments
            FOR SELECT TO public USING (true);
    END IF;

    -- Public insert policy for payment transactions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Public insert payment transaction'
    ) THEN
        CREATE POLICY "Public insert payment transaction" ON public.payment_transactions
            FOR INSERT TO public WITH CHECK (true);
    END IF;
END $$;

--------------------------------------------------------------------------------
-- 2. VERIFY SEQUENCES & TRIGGERS FOR CONCURRENCY-SAFE REGISTRATION NUMBERS
--------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.seq_participant_number START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_registration_number START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_participant_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'CGS-P-' || LPAD(nextval('public.seq_participant_number')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'CGS-REG-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.seq_registration_number')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_secure_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trg_auto_registration_details()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.registration_number IS NULL OR NEW.registration_number = '' THEN
        NEW.registration_number := public.generate_registration_number();
    END IF;
    IF NEW.qr_token IS NULL OR NEW.qr_token = '' THEN
        NEW.qr_token := public.generate_secure_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registrations_auto_details ON public.registrations;
CREATE TRIGGER trg_registrations_auto_details
BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.trg_auto_registration_details();

--------------------------------------------------------------------------------
-- 3. PARTICIPANT COUNT SYNC TRIGGER
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.registration_status = 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.event_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.registration_status <> 'confirmed' AND NEW.registration_status = 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.event_id;
        ELSIF (OLD.registration_status = 'confirmed' AND NEW.registration_status <> 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = GREATEST(0, current_participants - 1) 
            WHERE id = NEW.event_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.registration_status = 'confirmed') THEN
            UPDATE public.events 
            SET current_participants = GREATEST(0, current_participants - 1) 
            WHERE id = OLD.event_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registrations_count_sync ON public.registrations;
CREATE TRIGGER trg_registrations_count_sync
AFTER INSERT OR UPDATE OR DELETE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.update_event_participant_count();
