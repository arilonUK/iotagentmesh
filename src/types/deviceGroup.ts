
export interface DeviceGroup {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  device_count?: number;
}

export interface DeviceGroupMembership {
  id: string;
  device_id: string;
  group_id: string;
  added_at: string;
}

export type DeviceGroupFormData = Pick<DeviceGroup, 'name' | 'description'>;
