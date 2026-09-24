-- =============================================================================
-- CGS ENTERTAINMENTS - RAZORPAY PAYMENT MIGRATION
-- =============================================================================
-- Target Database: Supabase PostgreSQL
-- Purpose: Ensures all required Razorpay payment columns and indexes exist
-- =============================================================================

-- 1. REGISTRATIONS TABLE
-- Ensures payment status and registration status columns exist with valid checks
ALTER TABLE public.registrations 
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid' 
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS registration_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (registration_status IN ('pending', 'payment_pending', 'confirmed', 'cancelled', 'rejected', 'completed'));

-- Indexes for performance filtering
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_status ON public.registrations(registration_status);


-- 2. REGISTRATION PAYMENTS TABLE
-- Stores Razorpay Order ID, Payment ID, Signature, Amount, and Status
CREATE TABLE IF NOT EXISTS public.registration_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature TEXT,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    paid_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

-- Ensure all columns exist if table already pre-existed
ALTER TABLE public.registration_payments
  ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'created',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failure_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_registration_payments_registration_id ON public.registration_payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_payments_razorpay_order_id ON public.registration_payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_registration_payments_razorpay_payment_id ON public.registration_payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_registration_payments_status ON public.registration_payments(status);


-- 3. PAYMENT TRANSACTIONS TABLE
-- Financial Audit Trail for Payment Gateway logs and Webhook audits
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
    payment_id UUID REFERENCES public.registration_payments(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    gateway TEXT NOT NULL DEFAULT 'Razorpay',
    gateway_transaction_id VARCHAR(100),
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    gateway_response JSONB,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_registration_id ON public.payment_transactions(registration_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_tx_id ON public.payment_transactions(gateway_transaction_id);


-- 4. RLS POLICIES FOR PAYMENTS
ALTER TABLE public.registration_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full management payments" ON public.registration_payments
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins full management transactions" ON public.payment_transactions
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
