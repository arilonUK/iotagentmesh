
-- Revised Fix: Focus on application-level optimizations we can implement

-- Fix #1: Create a materialized view for timezone data to avoid repeated pg_timezone_names queries
CREATE MATERIALIZED VIEW IF NOT EXISTS public.timezone_cache AS
SELECT name, abbrev, utc_offset, is_dst
FROM pg_timezone_names
ORDER BY name;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_timezone_cache_name 
ON public.timezone_cache USING btree (name);

-- Create a function to refresh timezone cache (should be called periodically)
CREATE OR REPLACE FUNCTION public.refresh_timezone_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.timezone_cache;
END;
$$;

-- Fix #2: Create optimized indexes on our application tables for better query performance
-- These will significantly improve the performance of common queries

-- Index for devices by organization and status (very common query pattern)
CREATE INDEX IF NOT EXISTS idx_devices_organization_id_status 
ON public.devices USING btree (organization_id, status);

-- Index for devices by organization and product template
CREATE INDEX IF NOT EXISTS idx_devices_org_product_template 
ON public.devices USING btree (organization_id, product_template_id);

-- Index for device readings by device and reading type with timestamp (for analytics)
CREATE INDEX IF NOT EXISTS idx_device_readings_device_type_timestamp 
ON public.device_readings USING btree (device_id, reading_type, timestamp DESC);

-- Index for device readings by organization and timestamp (for dashboard queries)
CREATE INDEX IF NOT EXISTS idx_device_readings_org_timestamp 
ON public.device_readings USING btree (organization_id, timestamp DESC);

-- Index for organization members by user (for permission checks)
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id 
ON public.organization_members USING btree (user_id);

-- Index for organization members by organization and role
CREATE INDEX IF NOT EXISTS idx_organization_members_org_role 
ON public.organization_members USING btree (organization_id, role);

-- Index for product properties by product (for template queries)
CREATE INDEX IF NOT EXISTS idx_product_properties_product_id 
ON public.product_properties USING btree (product_id);

-- Index for alarms by organization and device (for dashboard queries)
CREATE INDEX IF NOT EXISTS idx_alarms_org_device_enabled 
ON public.alarms USING btree (organization_id, device_id, enabled);

-- Index for alarms by device and reading type (for trigger checks)
CREATE INDEX IF NOT EXISTS idx_alarms_device_reading_type 
ON public.alarms USING btree (device_id, reading_type, enabled);

-- Index for alarm events by alarm and status
CREATE INDEX IF NOT EXISTS idx_alarm_events_alarm_status 
ON public.alarm_events USING btree (alarm_id, status, triggered_at DESC);

-- Index for API usage analytics
CREATE INDEX IF NOT EXISTS idx_api_usage_org_created_status 
ON public.api_usage USING btree (organization_id, created_at DESC, status_code);

-- Index for API keys by organization and active status
CREATE INDEX IF NOT EXISTS idx_api_keys_org_active 
ON public.api_keys USING btree (organization_id, is_active);

-- Index for endpoints by organization and type
CREATE INDEX IF NOT EXISTS idx_endpoints_org_type_enabled 
ON public.endpoints USING btree (organization_id, type, enabled);

-- Index for notifications by user and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON public.notifications USING btree (user_id, is_read, created_at DESC);

-- Fix #3: Create optimized functions for common query patterns

-- Function to get device readings with better performance
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

-- Function to get organization summary data efficiently
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

-- Function to clean up old data periodically (helps with performance)
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
