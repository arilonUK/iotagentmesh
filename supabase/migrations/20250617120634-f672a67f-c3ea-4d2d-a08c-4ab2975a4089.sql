
-- Fix the check_usage_limits function to have an immutable search_path
CREATE OR REPLACE FUNCTION public.check_usage_limits(p_org_id uuid)
RETURNS TABLE(exceeds_device_limit boolean, exceeds_api_limit boolean, exceeds_data_limit boolean, current_plan_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    current_usage.data_volume_mb > (plan_limits.max_data_retention_days * 100) as exceeds_data_limit,
    plan_limits.display_name as current_plan_name;
END;
$function$
