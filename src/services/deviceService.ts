
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { toast } from '@/components/ui/use-toast';

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  try {
    // Try using RPC function instead of direct table access to bypass RLS issues
    const { data, error } = await supabase.rpc('get_organization_devices', {
      p_org_id: organizationId
    });
    
    if (error) {
      console.error('Error fetching devices via RPC:', error);
      // Fall back to a simple query without any joins if RPC fails
      return await fallbackDeviceQuery(organizationId);
    }
      
    return data.map(item => ({
      ...item,
      status: item.status as 'online' | 'offline' | 'warning'
    })) as Device[];
  } catch (error) {
    console.error('Error in fetchDevices:', error);
    // Fall back to simpler query if there's an exception
    return await fallbackDeviceQuery(organizationId);
  }
};

// Fallback query that avoids potential RLS issues
const fallbackDeviceQuery = async (organizationId: string): Promise<Device[]> => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('id, name, type, status, organization_id, last_active_at')
      .eq('organization_id', organizationId);
      
    if (error) {
      console.error('Error in fallback query:', error);
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
    
    return data.map(item => ({
      ...item,
      status: item.status as 'online' | 'offline' | 'warning'
    })) as Device[];
  } catch (error) {
    console.error('Error in fallback query:', error);
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
    // Direct query without any joins
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
    
    if (!data) return null;
    
    return {
      ...data,
      status: data.status as 'online' | 'offline' | 'warning'
    };
  } catch (error) {
    console.error('Error fetching device details:', error);
    return null; // Return null to handle this gracefully in the UI
  }
};
