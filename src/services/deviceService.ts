
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { toast } from '@/components/ui/use-toast';

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  try {
    console.log(`Starting fetchDevices with organization ID: ${organizationId}`);
    
    if (!organizationId) {
      console.error('fetchDevices called with empty organization ID');
      return [];
    }
    
    const { data, error } = await supabase
      .rpc('get_devices_by_org_id', { p_organization_id: organizationId });
    
    if (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Failed to load devices",
        description: `Database error: ${error.message}`,
        variant: "destructive",
      });
      return [];
    }
    
    if (!data) {
      console.warn('No data returned from devices query');
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} devices for organization: ${organizationId}`);
    
    return data as Device[];
  } catch (error) {
    console.error('Unexpected error in fetchDevices:', error);
    toast({
      title: "Failed to load devices",
      description: "There was an error with the database query. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};

export const fetchDevice = async (deviceId: string): Promise<Device | null> => {
  try {
    console.log('Fetching device:', deviceId);
    
    // Use direct table query instead of complex joins that might cause recursion
    const { data, error } = await supabase
      .from('devices')
      .select('id, name, type, status, organization_id, last_active_at, description')
      .eq('id', deviceId)
      .maybeSingle();
        
    if (error) {
      console.error('Error fetching device:', error);
      toast({
        title: "Error loading device",
        description: `Database error: ${error.message}`,
        variant: "destructive",
      });
      throw new Error(`Failed to load device: ${error.message}`);
    }
    
    if (!data) {
      console.log('Device not found:', deviceId);
      return null;
    }
    
    console.log('Device fetched successfully:', data);
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      status: data.status as 'online' | 'offline' | 'warning',
      organization_id: data.organization_id,
      last_active_at: data.last_active_at,
      description: data.description
    };
  } catch (error) {
    console.error('Error fetching device details:', error);
    toast({
      title: "Error loading device",
      description: "We couldn't load the device details. Please try again later.",
      variant: "destructive",
    });
    throw new Error(error instanceof Error ? error.message : "Unknown error fetching device");
  }
};
