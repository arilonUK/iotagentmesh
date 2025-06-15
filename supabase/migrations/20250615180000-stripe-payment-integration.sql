
-- Create payments table to track all payment transactions
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  payment_method_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create invoices table for invoice management
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount_due INTEGER NOT NULL,
  amount_paid INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_pdf_url TEXT,
  due_date TIMESTAMPTZ,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment_methods table to store customer payment methods
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- card, bank_account, etc.
  brand TEXT, -- visa, mastercard, etc.
  last_four TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add stripe_customer_id to organizations table if not exists
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments
CREATE POLICY "select_own_payments" ON public.payments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "insert_payments" ON public.payments
  FOR INSERT
  WITH CHECK (true); -- Edge functions will handle this

CREATE POLICY "update_payments" ON public.payments
  FOR UPDATE
  USING (true); -- Edge functions will handle this

-- Create RLS policies for invoices
CREATE POLICY "select_own_invoices" ON public.invoices
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "insert_invoices" ON public.invoices
  FOR INSERT
  WITH CHECK (true); -- Edge functions will handle this

CREATE POLICY "update_invoices" ON public.invoices
  FOR UPDATE
  USING (true); -- Edge functions will handle this

-- Create RLS policies for payment_methods
CREATE POLICY "select_own_payment_methods" ON public.payment_methods
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "insert_payment_methods" ON public.payment_methods
  FOR INSERT
  WITH CHECK (true); -- Edge functions will handle this

CREATE POLICY "update_payment_methods" ON public.payment_methods
  FOR UPDATE
  USING (true); -- Edge functions will handle this

-- Create indexes for better performance
CREATE INDEX idx_payments_organization_id ON public.payments(organization_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON public.invoices(stripe_invoice_id);
CREATE INDEX idx_payment_methods_organization_id ON public.payment_methods(organization_id);
CREATE INDEX idx_organizations_stripe_customer_id ON public.organizations(stripe_customer_id);
