
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
    
    // Direct query without RLS policy that's causing recursion
    const { data, error, status, statusText } = await supabase
      .from('devices')
      .select('*')
      .eq('organization_id', organizationId);
      
    console.log(`Supabase query completed with status: ${status} ${statusText}`);
    
    if (error) {
      console.error('Error fetching devices from Supabase:', error);
      console.error('Error details:', {
        errorCode: error.code,
        errorMessage: error.message,
        organizationId,
        hint: error.hint,
        details: error.details
      });
      
      // Special handling for the recursion error
      if (error.code === '42P17') {
        console.log('Attempting to recover from recursion error with simplified query');
        // Try a simpler query that avoids the recursion issue
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('devices')
          .select('id, name, type, status, organization_id, last_active_at, description')
          .eq('organization_id', organizationId);
          
        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          toast({
            title: "Failed to load devices",
            description: `Database error: ${fallbackError.message}`,
            variant: "destructive",
          });
          return [];
        }
        
        if (fallbackData) {
          console.log(`Successfully fetched ${fallbackData.length} devices with fallback query`);
          return fallbackData.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            status: item.status as 'online' | 'offline' | 'warning',
            organization_id: item.organization_id,
            last_active_at: item.last_active_at,
            description: item.description
          }));
        }
      }
      
      toast({
        title: "Failed to load devices",
        description: `Database error: ${error.message}`,
        variant: "destructive",
      });
      return []; // Return empty array to prevent UI errors
    }
    
    if (!data) {
      console.warn('No data returned from Supabase devices query');
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} devices for organization: ${organizationId}`);
    
    if (data.length === 0) {
      console.log('Zero devices found for organization:', organizationId);
    } else {
      console.log('Device sample:', data[0]);
    }
    
    const mappedDevices = data.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      status: item.status as 'online' | 'offline' | 'warning',
      organization_id: item.organization_id,
      last_active_at: item.last_active_at,
      description: item.description
    })) as Device[];
    
    console.log(`Mapped ${mappedDevices.length} devices successfully`);
    
    return mappedDevices;
  } catch (error) {
    console.error('Unexpected error in fetchDevices:', error);
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
