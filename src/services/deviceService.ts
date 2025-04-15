
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { toast } from '@/components/ui/use-toast';

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  const { data, error } = await supabase
    .from('devices')
    .select('id, name, type, status, organization_id, last_active_at')
    .eq('organization_id', organizationId);
    
  if (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
    
  return data as Device[];
};

export const fetchDevice = async (deviceId: string): Promise<Device | null> => {
  const { data, error } = await supabase
    .from('devices')
    .select('id, name, type, status, organization_id, last_active_at')
    .eq('id', deviceId)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching device:', error);
    toast({
      title: "Error loading device",
      description: "We couldn't load the device details. Please try again later.",
      variant: "destructive",
    });
    throw error;
  }
  
  return data;
};
