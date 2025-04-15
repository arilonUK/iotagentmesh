
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { toast } from '@/components/ui/use-toast';

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  try {
    console.log(`Fetching devices for organization: ${organizationId}`);
    
    const { data, error } = await supabase
      .from('devices')
      .select(`
        id,
        name,
        type, 
        status,
        organization_id,
        last_active_at,
        description
      `)
      .eq('organization_id', organizationId);
      
    if (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Failed to load devices",
        description: `Database error: ${error.message}`,
        variant: "destructive",
      });
      return []; // Return empty array to prevent UI errors
    }
    
    if (!data || data.length === 0) {
      console.log('No devices found for organization:', organizationId);
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} devices:`, data);
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      status: item.status as 'online' | 'offline' | 'warning',
      organization_id: item.organization_id,
      last_active_at: item.last_active_at,
      description: item.description
    })) as Device[];
  } catch (error) {
    console.error('Error in fetchDevices:', error);
    toast({
      title: "Failed to load devices",
      description: "There was an error with the database query. Please try again later.",
      variant: "destructive",
    });
    return []; // Return empty array to prevent UI errors
  }
};

export const fetchDevice = async (deviceId: string): Promise<Device | null> => {
  try {
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
      return null;
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
    return null;
  }
};
