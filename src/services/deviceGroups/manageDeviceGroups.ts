
import { supabase } from '@/integrations/supabase/client';
import { DeviceGroup, DeviceGroupFormData } from '@/types/deviceGroup';

/**
 * Create a new device group
 */
export const createDeviceGroup = async (
  organizationId: string, 
  groupData: DeviceGroupFormData
): Promise<DeviceGroup | null> => {
  try {
    const { data, error } = await supabase
      .from('device_groups')
      .insert({
        ...groupData,
        organization_id: organizationId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating device group:', error);
      return null;
    }
    
    return data as DeviceGroup;
  } catch (error) {
    console.error('Error in createDeviceGroup:', error);
    return null;
  }
};

/**
 * Update an existing device group
 */
export const updateDeviceGroup = async (
  groupId: string, 
  groupData: DeviceGroupFormData
): Promise<DeviceGroup | null> => {
  try {
    const { data, error } = await supabase
      .from('device_groups')
      .update(groupData)
      .eq('id', groupId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating device group:', error);
      return null;
    }
    
    return data as DeviceGroup;
  } catch (error) {
    console.error('Error in updateDeviceGroup:', error);
    return null;
  }
};

/**
 * Delete a device group
 */
export const deleteDeviceGroup = async (groupId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('device_groups')
      .delete()
      .eq('id', groupId);
    
    if (error) {
      console.error('Error deleting device group:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteDeviceGroup:', error);
    return false;
  }
};
