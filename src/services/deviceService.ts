
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { toast } from '@/components/ui/use-toast';

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  try {
    console.log(`Fetching devices for organization: ${organizationId}`);
    
    // Use RPC to call a stored function instead of querying the table directly
    // This avoids triggering complex RLS policies that might cause recursion
    const { data, error } = await supabase
      .rpc('get_organization_devices', { 
        p_organization_id: organizationId 
      });
      
    if (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Failed to load devices",
        description: "There was an error with the database query. Please try again later.",
        variant: "destructive",
      });
      return []; // Return empty array to prevent UI errors
    }
    
    if (!data || data.length === 0) {
      console.log('No devices found for organization:', organizationId);
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} devices`);
    
    return data.map(item => ({
      ...item,
      status: item.status as 'online' | 'offline' | 'warning'
    })) as Device[];
  } catch (error) {
    // If the RPC fails (e.g., if the function doesn't exist), fall back to direct query as a backup
    console.error('Error with RPC, falling back to direct query:', error);
    
    try {
      // Direct query with minimal fields and no joins
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
        console.error('Error in fallback query:', error);
        toast({
          title: "Failed to load devices",
          description: "There was an error with the database query. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log('No devices found in fallback query');
        return [];
      }
      
      console.log(`Fallback query found ${data.length} devices`);
      
      return data.map(item => ({
        ...item,
        status: item.status as 'online' | 'offline' | 'warning'
      })) as Device[];
    } catch (fallbackError) {
      console.error('Error in fallback query:', fallbackError);
      return [];
    }
  }
};

export const fetchDevice = async (deviceId: string): Promise<Device | null> => {
  try {
    // Try using RPC first
    const { data, error } = await supabase
      .rpc('get_device_by_id', { 
        p_device_id: deviceId 
      });
      
    if (error) {
      // If RPC fails, fall back to direct query
      console.error('Error with RPC for device details, trying direct query:', error);
      
      const { data: directData, error: directError } = await supabase
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .maybeSingle();
        
      if (directError) {
        console.error('Error fetching device with direct query:', directError);
        throw directError;
      }
      
      if (!directData) return null;
      
      return {
        ...directData,
        status: directData.status as 'online' | 'offline' | 'warning'
      };
    }
    
    if (!data) return null;
    
    return {
      ...data,
      status: data.status as 'online' | 'offline' | 'warning'
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
