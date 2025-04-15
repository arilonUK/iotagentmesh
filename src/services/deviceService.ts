
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { toast } from '@/components/ui/use-toast';

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  try {
    // Direct query without any joins to avoid RLS policy issues
    const { data, error } = await supabase
      .from('devices')
      .select('id, name, type, status, organization_id, last_active_at')
      .eq('organization_id', organizationId);
      
    if (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
      
    return data.map(item => ({
      ...item,
      status: item.status as 'online' | 'offline' | 'warning'
    })) as Device[];
  } catch (error) {
    console.error('Error fetching devices:', error);
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
