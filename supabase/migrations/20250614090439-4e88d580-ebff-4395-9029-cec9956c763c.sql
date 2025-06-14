
-- Fix 1: Add explicit search_path to functions with mutable search paths
-- This prevents search path injection attacks

-- Fix refresh_timezone_cache function
CREATE OR REPLACE FUNCTION public.refresh_timezone_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.timezone_cache;
END;
$$;

-- Fix get_device_readings_optimized function  
CREATE OR REPLACE FUNCTION public.get_device_readings_optimized(
  p_device_id UUID,
  p_reading_type TEXT DEFAULT NULL,
  p_start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '24 hours',
  p_end_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  p_limit INTEGER DEFAULT 1000
)
RETURNS TABLE(
  id UUID,
  device_id UUID,
  reading_type VARCHAR,
  value DOUBLE PRECISION,
  reading_timestamp TIMESTAMP WITH TIME ZONE,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dr.id,
    dr.device_id,
    dr.reading_type,
    dr.value,
    dr.timestamp,
    dr.metadata
  FROM device_readings dr
  WHERE dr.device_id = p_device_id
    AND (p_reading_type IS NULL OR dr.reading_type = p_reading_type)
    AND dr.timestamp BETWEEN p_start_time AND p_end_time
  ORDER BY dr.timestamp DESC
  LIMIT p_limit;
END;
$$;

-- Fix get_organization_summary function
CREATE OR REPLACE FUNCTION public.get_organization_summary(p_organization_id UUID)
RETURNS TABLE(
  total_devices BIGINT,
  active_devices BIGINT,
  total_alarms BIGINT,
  active_alarms BIGINT,
  total_endpoints BIGINT,
  active_endpoints BIGINT,
  recent_readings_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM devices WHERE organization_id = p_organization_id) as total_devices,
    (SELECT COUNT(*) FROM devices WHERE organization_id = p_organization_id AND status = 'active') as active_devices,
    (SELECT COUNT(*) FROM alarms WHERE organization_id = p_organization_id) as total_alarms,
    (SELECT COUNT(*) FROM alarms WHERE organization_id = p_organization_id AND enabled = true) as active_alarms,
    (SELECT COUNT(*) FROM endpoints WHERE organization_id = p_organization_id) as total_endpoints,
    (SELECT COUNT(*) FROM endpoints WHERE organization_id = p_organization_id AND enabled = true) as active_endpoints,
    (SELECT COUNT(*) FROM device_readings dr 
     JOIN devices d ON dr.device_id = d.id 
     WHERE d.organization_id = p_organization_id 
     AND dr.timestamp > NOW() - INTERVAL '24 hours') as recent_readings_count;
END;
$$;

-- Fix cleanup_old_data function
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clean up old API usage logs (keep last 90 days)
  DELETE FROM api_usage WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up old API request logs (keep last 30 days)
  DELETE FROM api_requests_log WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Clean up old device readings based on data bucket retention settings
  -- This should be customized based on your retention policies
  DELETE FROM device_readings 
  WHERE timestamp < NOW() - INTERVAL '1 year'
  AND device_id NOT IN (
    SELECT DISTINCT device_id 
    FROM data_buckets 
    WHERE retention_days > 365
  );
  
  -- Clean up expired notifications
  DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  -- Refresh the timezone cache
  REFRESH MATERIALIZED VIEW timezone_cache;
END;
$$;

-- Fix 2: Secure the timezone_cache materialized view by revoking public access
-- Remove access from anon and authenticated roles for security
REVOKE ALL ON public.timezone_cache FROM anon;
REVOKE ALL ON public.timezone_cache FROM authenticated;

-- Grant access only to specific functions that need it
GRANT SELECT ON public.timezone_cache TO postgres;

-- Create a secure function to access timezone data if needed by the application
CREATE OR REPLACE FUNCTION public.get_timezone_info(timezone_name TEXT DEFAULT NULL)
RETURNS TABLE(
  name TEXT,
  abbrev TEXT,
  utc_offset INTERVAL,
  is_dst BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF timezone_name IS NULL THEN
    RETURN QUERY
    SELECT tc.name, tc.abbrev, tc.utc_offset, tc.is_dst
    FROM timezone_cache tc
    ORDER BY tc.name;
  ELSE
    RETURN QUERY
    SELECT tc.name, tc.abbrev, tc.utc_offset, tc.is_dst
    FROM timezone_cache tc
    WHERE tc.name = timezone_name;
  END IF;
END;
$$;
