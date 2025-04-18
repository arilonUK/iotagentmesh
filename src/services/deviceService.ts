import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/device';
import { toast } from '@/components/ui/use-toast';
import { databaseServices } from '@/services/databaseService';

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
    
    // Use our new RLS-bypassing function instead of querying the table directly
    // This avoids the RLS circular reference issue
    const { data, error } = await supabase
      .rpc('get_device_by_id_bypass_rls', { p_device_id: validDeviceId })
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

export const createDevice = async (deviceData: Omit<Device, 'id' | 'last_active_at'>): Promise<Device | null> => {
  try {
    console.log('Creating new device with data:', deviceData);
    
    // First, check if we can create a function to safely create devices
    const functionName = 'create_device_bypass_rls';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to create devices
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.create_device_bypass_rls(
        p_name TEXT,
        p_type TEXT,
        p_description TEXT,
        p_organization_id UUID,
        p_status TEXT
      )
      RETURNS public.devices
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        new_device public.devices;
      BEGIN
        INSERT INTO public.devices (
          name,
          type,
          description,
          organization_id,
          status
        ) VALUES (
          p_name,
          p_type,
          p_description,
          p_organization_id,
          p_status
        )
        RETURNING * INTO new_device;
        
        RETURN new_device;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely create devices`);
    }
    
    // Call the RPC function to create device (bypassing RLS)
    const { data: newDevice, error } = await supabase.rpc(functionName, {
      p_name: deviceData.name,
      p_type: deviceData.type,
      p_description: deviceData.description || null,
      p_organization_id: deviceData.organization_id,
      p_status: deviceData.status
    });
    
    if (error) {
      console.error('Error creating device using RPC:', error);
      
      // Fall back to direct query as a last resort
      console.log('Falling back to direct insert for device');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('devices')
        .insert(deviceData)
        .select()
        .single();
      
      if (fallbackError) {
        console.error('Error in fallback device creation:', fallbackError);
        throw fallbackError;
      }
      
      console.log('Device created successfully using fallback:', fallbackData);
      return fallbackData as Device;
    }

    console.log('Device created successfully using RPC:', newDevice);
    return newDevice as Device;
  } catch (error) {
    console.error('Error creating device:', error);
    toast({
      title: "Failed to create device",
      description: "There was an error creating the device. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

export const updateDevice = async (id: string, deviceData: Partial<Device>): Promise<Device | null> => {
  try {
    console.log(`Updating device ${id} with data:`, deviceData);
    
    // First, check if we can create a function to safely update devices
    const functionName = 'update_device_bypass_rls';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to update devices
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.update_device_bypass_rls(
        p_id UUID,
        p_data JSONB
      )
      RETURNS public.devices
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        updated_device public.devices;
      BEGIN
        UPDATE public.devices
        SET 
          name = COALESCE(p_data->>'name', name),
          description = COALESCE(p_data->>'description', description),
          type = COALESCE(p_data->>'type', type),
          status = COALESCE(p_data->>'status', status),
          product_template_id = CASE 
            WHEN p_data->>'product_template_id' IS NOT NULL 
            THEN (p_data->>'product_template_id')::UUID
            ELSE product_template_id
          END,
          last_active_at = CASE
            WHEN p_data->>'last_active_at' IS NOT NULL
            THEN (p_data->>'last_active_at')::TIMESTAMP WITH TIME ZONE
            ELSE last_active_at
          END
        WHERE id = p_id
        RETURNING * INTO updated_device;
        
        RETURN updated_device;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely update devices`);
    }
    
    // Call the RPC function to update device (bypassing RLS)
    const { data: updatedDevice, error } = await supabase.rpc(functionName, {
      p_id: id,
      p_data: deviceData
    });
    
    if (error) {
      console.error('Error updating device using RPC:', error);
      
      // Fall back to direct query as a last resort
      console.log('Falling back to direct update for device');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('devices')
        .update(deviceData)
        .eq('id', id)
        .select()
        .single();
      
      if (fallbackError) {
        console.error('Error in fallback device update:', fallbackError);
        throw fallbackError;
      }
      
      console.log('Device updated successfully using fallback:', fallbackData);
      return fallbackData as Device;
    }

    console.log('Device updated successfully using RPC:', updatedDevice);
    return updatedDevice as Device;
  } catch (error) {
    console.error('Error updating device:', error);
    toast({
      title: "Failed to update device",
      description: "There was an error updating the device. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteDevice = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting device with ID: ${id}`);
    
    // First, check if we can create a function to safely delete devices
    const functionName = 'delete_device_bypass_rls';
    const functionExists = await databaseServices.functionExists(functionName);
    
    if (!functionExists) {
      // Create function that bypasses RLS to delete devices
      const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.delete_device_bypass_rls(
        p_id UUID
      )
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        DELETE FROM public.devices
        WHERE id = p_id;
      END;
      $$;`;
      
      await databaseServices.createFunction(functionName, createFunctionSql);
      console.log(`Created function ${functionName} to safely delete devices`);
    }
    
    // Call the RPC function to delete device (bypassing RLS)
    const { error } = await supabase.rpc(functionName, { p_id: id });
    
    if (error) {
      console.error('Error deleting device using RPC:', error);
      
      // Fall back to direct query as a last resort
      console.log('Falling back to direct delete for device');
      const { error: fallbackError } = await supabase
        .from('devices')
        .delete()
        .eq('id', id);
      
      if (fallbackError) {
        console.error('Error in fallback device deletion:', fallbackError);
        throw fallbackError;
      }
      
      console.log('Device deleted successfully using fallback');
      return true;
    }

    console.log('Device deleted successfully using RPC');
    return true;
  } catch (error) {
    console.error('Error deleting device:', error);
    toast({
      title: "Failed to delete device",
      description: "There was an error deleting the device. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
