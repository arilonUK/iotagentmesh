
CREATE OR REPLACE FUNCTION public.update_device_bypass_rls(
  p_device_id uuid,
  p_data jsonb
)
RETURNS devices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_device public.devices;
BEGIN
  UPDATE public.devices
  SET 
    name = COALESCE(p_data->>'name', name),
    type = COALESCE(p_data->>'type', type),
    status = COALESCE(p_data->>'status', status),
    description = COALESCE(p_data->>'description', description),
    product_template_id = COALESCE((p_data->>'product_template_id')::uuid, product_template_id),
    last_active_at = now()
  WHERE id = p_device_id
  RETURNING * INTO updated_device;
  
  RETURN updated_device;
END;
$function$
