
CREATE OR REPLACE FUNCTION public.create_device_bypass_rls(
  p_name text,
  p_type text,
  p_status text,
  p_description text,
  p_organization_id uuid,
  p_product_template_id uuid
)
RETURNS devices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_device public.devices;
BEGIN
  INSERT INTO public.devices (
    name,
    type,
    status,
    description,
    organization_id,
    product_template_id
  ) VALUES (
    p_name,
    p_type,
    p_status,
    p_description,
    p_organization_id,
    p_product_template_id
  )
  RETURNING * INTO new_device;
  
  RETURN new_device;
END;
$function$
