
CREATE OR REPLACE FUNCTION public.delete_device_bypass_rls(
  p_device_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.devices
  WHERE id = p_device_id;
END;
$function$
