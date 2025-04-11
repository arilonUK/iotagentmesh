
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  organization_id: string;
  last_active_at: string;
  description?: string;
}

export const useDevices = (organizationId?: string) => {
  const {
    data: devices = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['devices', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (error) {
        console.error('Error fetching devices:', error);
        return [];
      }
      
      return data as unknown as Device[];
    },
    enabled: !!organizationId,
  });
  
  return {
    devices,
    isLoading,
    error,
    refetch
  };
};

// Adding the useDevice hook for a single device
export const useDevice = (deviceId?: string) => {
  const {
    data: device,
    isLoading,
    error
  } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .single();
      
      if (error) {
        console.error('Error fetching device:', error);
        throw new Error(error.message);
      }
      
      return data as unknown as Device;
    },
    enabled: !!deviceId,
  });
  
  return {
    device,
    isLoading,
    error: error ? (error as Error).message : null
  };
};
