
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { toast } from '@/components/ui/use-toast';

/**
 * Validates and formats a device ID to ensure it's in the correct format for the database
 * @param deviceId The device ID to validate
 * @returns A properly formatted device ID or null if the ID is invalid
 */
const validateDeviceId = (deviceId: string): string | null => {
  // Log the original input for debugging
  console.log('Validating device ID:', deviceId, 'Type:', typeof deviceId);

  if (!deviceId) {
    console.warn('Empty device ID provided to validator');
    return null;
  }

  // Remove any extra whitespace
  let formattedId = deviceId.trim();
  
  // Check if it's a valid UUID format (8-4-4-4-12)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUuid = uuidRegex.test(formattedId);
  
  if (!isValidUuid) {
    console.warn(`Device ID ${formattedId} is not in valid UUID format`);
    return null;
  }
  
  console.log(`Device ID ${formattedId} is in valid UUID format`);
  return formattedId;
};

export const fetchDevices = async (organizationId: string): Promise<Device[]> => {
  try {
    console.log(`Starting fetchDevices with organization ID: ${organizationId}`);
    
    if (!organizationId) {
      console.error('fetchDevices called with empty organization ID');
      return [];
    }
    
    // Validate organization ID is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(organizationId)) {
      console.error('fetchDevices called with invalid UUID format:', organizationId);
      toast({
        title: "Failed to load devices",
        description: "Invalid organization ID format",
        variant: "destructive",
      });
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
    // Validate and format the device ID 
    const validDeviceId = validateDeviceId(deviceId);
    console.log('Fetching device with validated ID:', validDeviceId);
    
    if (!validDeviceId) {
      console.error('Invalid device ID provided:', deviceId);
      toast({
        title: "Error loading device",
        description: "Invalid device ID format",
        variant: "destructive",
      });
      return null;
    }
    
    // Using .maybeSingle() instead of .single() to handle the case where no device is found
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('id', validDeviceId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching device:', error);
      console.error('Device ID:', validDeviceId);
      console.error('Device ID type:', typeof validDeviceId);
      toast({
        title: "Error loading device",
        description: `Database error: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
    
    if (!data) {
      console.log('Device not found for ID:', validDeviceId);
      return null;
    }
    
    console.log('Device fetched successfully:', data);
    return data as Device;
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
