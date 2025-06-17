
-- Fix the check_usage_limits function to resolve type mismatch errors
CREATE OR REPLACE FUNCTION public.check_usage_limits(p_org_id uuid)
RETURNS TABLE(
  exceeds_device_limit boolean, 
  exceeds_api_limit boolean, 
  exceeds_data_limit boolean, 
  current_plan_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_usage RECORD;
  plan_limits RECORD;
BEGIN
  -- Get current usage with explicit type casting
  SELECT 
    COALESCE(device_count, 0)::bigint as device_count,
    COALESCE(api_calls_this_month, 0)::bigint as api_calls_this_month,
    COALESCE(data_volume_mb, 0)::bigint as data_volume_mb,
    COALESCE(active_connections, 0)::bigint as active_connections
  INTO current_usage
  FROM public.get_organization_current_usage(p_org_id);
  
  -- Get plan limits
  SELECT 
    sp.display_name,
    sp.max_devices::bigint,
    sp.max_api_calls_per_month::bigint,
    sp.max_data_retention_days::bigint
  INTO plan_limits
  FROM subscription_plans sp
  JOIN organization_subscriptions os ON sp.id = os.subscription_plan_id
  WHERE os.organization_id = p_org_id
  AND os.status = 'active'
  ORDER BY os.created_at DESC
  LIMIT 1;
  
  -- If no active subscription, use free plan limits
  IF plan_limits IS NULL THEN
    SELECT 
      display_name,
      max_devices::bigint,
      max_api_calls_per_month::bigint,
      max_data_retention_days::bigint
    INTO plan_limits 
    FROM subscription_plans 
    WHERE name = 'free' 
    LIMIT 1;
  END IF;
  
  -- Return results with proper type casting
  RETURN QUERY
  SELECT 
    (current_usage.device_count > plan_limits.max_devices) as exceeds_device_limit,
    (current_usage.api_calls_this_month > plan_limits.max_api_calls_per_month) as exceeds_api_limit,
    (current_usage.data_volume_mb > (plan_limits.max_data_retention_days * 100)) as exceeds_data_limit,
    plan_limits.display_name as current_plan_name;
END;
$function$;

-- Also fix the get_organization_current_usage function
CREATE OR REPLACE FUNCTION public.get_organization_current_usage(p_org_id uuid)
RETURNS TABLE(
  device_count bigint,
  api_calls_this_month bigint,
  data_volume_mb bigint,
  active_connections bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT COUNT(*)::bigint FROM devices WHERE organization_id = p_org_id), 0) as device_count,
    COALESCE((SELECT COUNT(*)::bigint FROM api_usage WHERE organization_id = p_org_id AND created_at >= date_trunc('month', now())), 0) as api_calls_this_month,
    COALESCE((SELECT SUM(COALESCE(volume_bytes, 0) / 1024 / 1024)::bigint FROM data_volume_usage WHERE organization_id = p_org_id AND period_date >= date_trunc('month', now())), 0) as data_volume_mb,
    COALESCE((SELECT COUNT(*)::bigint FROM device_connections WHERE organization_id = p_org_id AND connection_end IS NULL), 0) as active_connections;
END;
$function$;
