
import { supabase } from '@/integrations/supabase/client';
import { DeviceGroup } from '@/types/deviceGroup';

/**
 * Fetch all device groups for a specific organization
 */
export const fetchDeviceGroups = async (organizationId: string): Promise<DeviceGroup[]> => {
  try {
    console.log(`Fetching device groups for organization: ${organizationId}`);
    
    const { data, error } = await supabase
      .from('device_groups')
      .select(`
        *,
        device_count:device_group_memberships(count)
      `)
      .eq('organization_id', organizationId);
    
    if (error) {
      console.error('Error fetching device groups:', error);
      throw new Error(`Failed to fetch device groups: ${error.message}`);
    }
    
    // Process the results to get the device count for each group
    const groupsWithCount = data.map(group => ({
      ...group,
      device_count: group.device_count?.[0]?.count || 0
    }));
    
    return groupsWithCount as DeviceGroup[];
  } catch (error) {
    console.error('Unexpected error in fetchDeviceGroups:', error);
    return [];
  }
};

/**
 * Fetch a specific device group by ID with its devices
 */
export const fetchDeviceGroup = async (groupId: string): Promise<DeviceGroup | null> => {
  try {
    const { data, error } = await supabase
      .from('device_groups')
      .select(`
        *,
        devices:device_group_memberships(
          device:devices(id, name, type, status)
        )
      `)
      .eq('id', groupId)
      .single();
    
    if (error) {
      console.error('Error fetching device group:', error);
      return null;
    }
    
    return data as unknown as DeviceGroup;
  } catch (error) {
    console.error('Error in fetchDeviceGroup:', error);
    return null;
  }
};
