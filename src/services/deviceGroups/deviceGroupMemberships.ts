
import { supabase } from '@/integrations/supabase/client';
import { DeviceGroup } from '@/types/deviceGroup';

/**
 * Add a device to a group
 */
export const addDeviceToGroup = async (deviceId: string, groupId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('device_group_memberships')
      .insert({
        device_id: deviceId,
        group_id: groupId
      });
    
    if (error) {
      console.error('Error adding device to group:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in addDeviceToGroup:', error);
    return false;
  }
};

/**
 * Remove a device from a group
 */
export const removeDeviceFromGroup = async (deviceId: string, groupId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('device_group_memberships')
      .delete()
      .eq('device_id', deviceId)
      .eq('group_id', groupId);
    
    if (error) {
      console.error('Error removing device from group:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in removeDeviceFromGroup:', error);
    return false;
  }
};

/**
 * Get all groups a device belongs to
 */
export const getDeviceGroups = async (deviceId: string): Promise<DeviceGroup[]> => {
  try {
    const { data, error } = await supabase
      .from('device_group_memberships')
      .select(`
        group:device_groups(*)
      `)
      .eq('device_id', deviceId);
    
    if (error) {
      console.error('Error fetching groups for device:', error);
      return [];
    }
    
    // Extract the groups from the data
    return data.map(item => item.group) as unknown as DeviceGroup[];
  } catch (error) {
    console.error('Error in getDeviceGroups:', error);
    return [];
  }
};

/**
 * Add multiple devices to a group
 */
export const batchAddDevicesToGroup = async (deviceIds: string[], groupId: string): Promise<boolean> => {
  try {
    const memberships = deviceIds.map(deviceId => ({
      device_id: deviceId,
      group_id: groupId
    }));
    
    const { error } = await supabase
      .from('device_group_memberships')
      .insert(memberships);
    
    if (error) {
      console.error('Error batch adding devices to group:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in batchAddDevicesToGroup:', error);
    return false;
  }
};

/**
 * Remove multiple devices from a group
 */
export const batchRemoveDevicesFromGroup = async (deviceIds: string[], groupId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('device_group_memberships')
      .delete()
      .in('device_id', deviceIds)
      .eq('group_id', groupId);
    
    if (error) {
      console.error('Error batch removing devices from group:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in batchRemoveDevicesFromGroup:', error);
    return false;
  }
};
