
import { supabase } from '@/integrations/supabase/client';
import { DeviceConnection, DataVolumeUsage } from '@/types/billing';

export const deviceConnectionService = {
  // Device Connections
  async getDeviceConnections(
    organizationId: string,
    deviceId?: string,
    activeOnly = false
  ): Promise<DeviceConnection[]> {
    let query = supabase
      .from('device_connections')
      .select('*')
      .eq('organization_id', organizationId)
      .order('connection_start', { ascending: false });

    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    if (activeOnly) {
      query = query.is('connection_end', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Data Volume Usage
  async getDataVolumeUsage(
    organizationId: string,
    startDate?: string,
    endDate?: string,
    dataType?: 'ingestion' | 'egress' | 'storage'
  ): Promise<DataVolumeUsage[]> {
    let query = supabase
      .from('data_volume_usage')
      .select('*')
      .eq('organization_id', organizationId)
      .order('recorded_at', { ascending: false });

    if (startDate) {
      query = query.gte('period_date', startDate);
    }

    if (endDate) {
      query = query.lte('period_date', endDate);
    }

    if (dataType) {
      query = query.eq('data_type', dataType);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data.map(usage => ({
      ...usage,
      data_type: usage.data_type as 'ingestion' | 'egress' | 'storage'
    }));
  },

  async recordDataVolumeUsage(
    organizationId: string,
    deviceId: string,
    dataType: 'ingestion' | 'egress' | 'storage',
    volumeBytes: number
  ): Promise<DataVolumeUsage> {
    const { data, error } = await supabase
      .from('data_volume_usage')
      .insert({
        organization_id: organizationId,
        device_id: deviceId,
        data_type: dataType,
        volume_bytes: volumeBytes,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      data_type: data.data_type as 'ingestion' | 'egress' | 'storage'
    };
  },
};
