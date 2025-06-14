
-- Enhanced subscription plans with detailed features
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS billing_interval VARCHAR(20) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS max_devices INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_api_calls_per_month BIGINT DEFAULT 10000,
ADD COLUMN IF NOT EXISTS max_data_retention_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS advanced_analytics BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS priority_support BOOLEAN DEFAULT false;

-- Add check constraints for billing interval (PostgreSQL doesn't support IF NOT EXISTS for constraints)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_billing_interval') THEN
        ALTER TABLE public.subscription_plans 
        ADD CONSTRAINT check_billing_interval 
        CHECK (billing_interval IN ('monthly', 'yearly'));
    END IF;
END $$;

-- Organization subscriptions table
CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES public.subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active',
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT now() + INTERVAL '1 month',
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT check_subscription_status 
  CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete'))
);

-- Usage metrics table for detailed tracking
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL,
  metric_value BIGINT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Device connection tracking
CREATE TABLE IF NOT EXISTS public.device_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_start TIMESTAMPTZ DEFAULT now(),
  connection_end TIMESTAMPTZ,
  duration_seconds INTEGER,
  connection_type VARCHAR(20) DEFAULT 'mqtt',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Data volume tracking
CREATE TABLE IF NOT EXISTS public.data_volume_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  data_type VARCHAR(20) NOT NULL, -- 'ingestion', 'egress', 'storage'
  volume_bytes BIGINT NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  period_date DATE DEFAULT CURRENT_DATE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_org_id 
ON public.organization_subscriptions(organization_id);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_org_period 
ON public.usage_metrics(organization_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_device_connections_org_device 
ON public.device_connections(organization_id, device_id);

CREATE INDEX IF NOT EXISTS idx_data_volume_org_date 
ON public.data_volume_usage(organization_id, period_date);

-- Update existing subscription plans or insert if they don't exist
INSERT INTO public.subscription_plans (
  name, display_name, price, currency, billing_interval,
  max_devices, max_api_calls_per_month, max_data_retention_days,
  advanced_analytics, priority_support, features, is_active
) VALUES 
(
  'free', 'Free Plan', 0, 'USD', 'monthly',
  5, 10000, 7, false, false,
  ARRAY['basic_dashboard', 'basic_alerts'], true
),
(
  'professional', 'Professional Plan', 29.99, 'USD', 'monthly',
  50, 100000, 30, true, false,
  ARRAY['advanced_dashboard', 'custom_alerts', 'api_access'], true
),
(
  'enterprise', 'Enterprise Plan', 99.99, 'USD', 'monthly',
  500, 1000000, 365, true, true,
  ARRAY['unlimited_dashboard', 'advanced_alerts', 'full_api_access', 'white_label'], true
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  billing_interval = EXCLUDED.billing_interval,
  max_devices = EXCLUDED.max_devices,
  max_api_calls_per_month = EXCLUDED.max_api_calls_per_month,
  max_data_retention_days = EXCLUDED.max_data_retention_days,
  advanced_analytics = EXCLUDED.advanced_analytics,
  priority_support = EXCLUDED.priority_support,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Function to get current usage for organization
CREATE OR REPLACE FUNCTION public.get_organization_current_usage(p_org_id UUID)
RETURNS TABLE(
  device_count BIGINT,
  api_calls_this_month BIGINT,
  data_volume_mb BIGINT,
  active_connections BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM devices WHERE organization_id = p_org_id) as device_count,
    (SELECT COALESCE(SUM(CASE WHEN au.created_at >= date_trunc('month', now()) THEN 1 ELSE 0 END), 0)
     FROM api_usage au WHERE au.organization_id = p_org_id) as api_calls_this_month,
    (SELECT COALESCE(SUM(volume_bytes / 1024 / 1024), 0)
     FROM data_volume_usage dvu 
     WHERE dvu.organization_id = p_org_id 
     AND dvu.period_date >= date_trunc('month', now())::date) as data_volume_mb,
    (SELECT COUNT(*) 
     FROM device_connections dc 
     WHERE dc.organization_id = p_org_id 
     AND dc.connection_end IS NULL) as active_connections;
END;
$$;

-- Function to check if organization exceeds limits
CREATE OR REPLACE FUNCTION public.check_usage_limits(p_org_id UUID)
RETURNS TABLE(
  exceeds_device_limit BOOLEAN,
  exceeds_api_limit BOOLEAN,
  exceeds_data_limit BOOLEAN,
  current_plan_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage RECORD;
  plan_limits RECORD;
BEGIN
  -- Get current usage
  SELECT * INTO current_usage FROM public.get_organization_current_usage(p_org_id);
  
  -- Get plan limits
  SELECT sp.* INTO plan_limits
  FROM subscription_plans sp
  JOIN organization_subscriptions os ON sp.id = os.subscription_plan_id
  WHERE os.organization_id = p_org_id
  AND os.status = 'active'
  ORDER BY os.created_at DESC
  LIMIT 1;
  
  -- If no active subscription, use free plan limits
  IF plan_limits IS NULL THEN
    SELECT * INTO plan_limits FROM subscription_plans WHERE name = 'free' LIMIT 1;
  END IF;
  
  RETURN QUERY
  SELECT 
    current_usage.device_count > plan_limits.max_devices as exceeds_device_limit,
    current_usage.api_calls_this_month > plan_limits.max_api_calls_per_month as exceeds_api_limit,
    current_usage.data_volume_mb > (plan_limits.max_data_retention_days * 100) as exceeds_data_limit, -- 100MB per day limit
    plan_limits.display_name as current_plan_name;
END;
$$;

-- Enable RLS on new tables
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_volume_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for organization_subscriptions
CREATE POLICY "Users can view their organization subscriptions"
ON public.organization_subscriptions FOR SELECT
USING (public.is_org_member(organization_id));

-- RLS policies for usage_metrics
CREATE POLICY "Users can view their organization usage metrics"
ON public.usage_metrics FOR SELECT
USING (public.is_org_member(organization_id));

-- RLS policies for device_connections
CREATE POLICY "Users can view their organization device connections"
ON public.device_connections FOR SELECT
USING (public.is_org_member(organization_id));

-- RLS policies for data_volume_usage
CREATE POLICY "Users can view their organization data volume usage"
ON public.data_volume_usage FOR SELECT
USING (public.is_org_member(organization_id));
