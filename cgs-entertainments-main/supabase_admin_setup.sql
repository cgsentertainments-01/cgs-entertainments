-- =============================================================================
-- CGS ENTERTAINMENTS - ADMIN AUTHENTICATION & AUTHORIZATION SETUP SCRIPT
-- =============================================================================
-- Execute this script in your Supabase SQL Editor to ensure full sync between
-- Supabase Auth (auth.users) and Application Admins (public.admins).
-- =============================================================================

-- 1. LINK EXISTING ADMIN PROFILES WITH SUPABASE AUTH USERS BY EMAIL
-- Automatically populates auth_user_id if currently null or mismatched.
UPDATE public.admins a
SET auth_user_id = u.id
FROM auth.users u
WHERE LOWER(a.email) = LOWER(u.email)
  AND (a.auth_user_id IS NULL OR a.auth_user_id <> u.id);

-- 2. CREATE / UPDATE SECURITY DEFINER FUNCTION FOR ADMIN CHECK
-- Avoids recursive RLS policy evaluation by executing with creator privileges.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admins
        WHERE (
            auth_user_id = auth.uid()
            OR id = auth.uid()
            OR LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
        )
        AND is_active = true
    );
$$;

-- 3. ENSURE ROW LEVEL SECURITY POLICIES ON PUBLIC.ADMINS TABLE
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to avoid duplication
DROP POLICY IF EXISTS "Admins full management" ON public.admins;
DROP POLICY IF EXISTS "Allow authenticated read own admin profile" ON public.admins;

-- Policy A: Authenticated user can read their own matching admin profile
CREATE POLICY "Allow authenticated read own admin profile" ON public.admins
    FOR SELECT TO authenticated
    USING (
        auth_user_id = auth.uid()
        OR id = auth.uid()
        OR LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
    );

-- Policy B: Active admins have full management access over public.admins
CREATE POLICY "Admins full management" ON public.admins
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. DIAGNOSTIC QUERIES (Safe - No passwords exposed)
-- Verify auth users vs public.admins matching status:
SELECT 
    u.id AS auth_user_id,
    u.email AS auth_email,
    u.confirmed_at,
    a.id AS admin_id,
    a.role AS admin_role,
    a.is_active AS admin_is_active
FROM auth.users u
LEFT JOIN public.admins a 
    ON (a.auth_user_id = u.id OR LOWER(a.email) = LOWER(u.email))
ORDER BY u.created_at DESC;
