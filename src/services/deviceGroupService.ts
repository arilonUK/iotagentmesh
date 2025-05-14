
import { supabase } from '@/integrations/supabase/client';
import { DeviceGroup, DeviceGroupFormData } from '@/types/deviceGroup';

export const fetchDeviceGroups = async (organizationId: string): Promise<DeviceGroup[]> => {
  try {
    console.log(`Fetching device groups for organization: ${organizationId}`);
    
    const { data, error } = await supabase
      .from('device_groups')
      .select(`
        *,
        device_group_memberships:device_group_memberships(count)
      `)
      .eq('organization_id', organizationId);
    
    if (error) {
      console.error('Error fetching device groups:', error);
      throw new Error(`Failed to fetch device groups: ${error.message}`);
    }
    
    // Process the results to get the device count for each group
    const groupsWithCount = data.map(group => ({
      ...group,
      device_count: group.device_group_memberships[0].count
    }));
    
    return groupsWithCount;
  } catch (error) {
    console.error('Unexpected error in fetchDeviceGroups:', error);
    return [];
  }
};

export const fetchDeviceGroup = async (groupId: string): Promise<DeviceGroup | null> => {
  try {
    const { data, error } = await supabase
      .from('device_groups')
      .select(`
        *,
        device_group_memberships:device_group_memberships(
          devices:devices(id, name, type, status)
        )
      `)
      .eq('id', groupId)
      .single();
    
    if (error) {
      console.error('Error fetching device group:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchDeviceGroup:', error);
    return null;
  }
};

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
    
    return data;
  } catch (error) {
    console.error('Error in createDeviceGroup:', error);
    return null;
  }
};

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
    
    return data;
  } catch (error) {
    console.error('Error in updateDeviceGroup:', error);
    return null;
  }
};

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
    
    return data.map(item => item.group);
  } catch (error) {
    console.error('Error in getDeviceGroups:', error);
    return [];
  }
};

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
