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
      
      try {
        const { data, error } = await supabase
          .from('devices')
          .select('*')
          .eq('organization_id', organizationId);
        
        if (error) {
          console.error('Error fetching devices:', error);
          throw error;
        }
        
        return data as unknown as Device[];
      } catch (err) {
        console.error('Failed to fetch devices:', err);
        return [];
      }
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

export const useDevice = (deviceId?: string) => {
  const {
    data: device,
    isLoading,
    error
  } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      
      try {
        const { data, error } = await supabase
          .from('devices')
          .select('*')
          .eq('id', deviceId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching device:', error);
          
          if (process.env.NODE_ENV === 'development') {
            if (deviceId === '1') {
              return {
                id: '1',
                name: 'Temperature Sensor',
                type: 'Sensor',
                status: 'online' as const,
                organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
                last_active_at: new Date().toISOString(),
                description: 'Main temperature sensor'
              } as Device;
            } else if (deviceId === '2') {
              return {
                id: '2',
                name: 'Smart Light',
                type: 'Actuator',
                status: 'online' as const,
                organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
                last_active_at: new Date().toISOString(),
                description: 'Smart light device for testing'
              } as Device;
            } else if (deviceId === '3') {
              return {
                id: '3',
                name: 'Motion Detector',
                type: 'Sensor',
                status: 'offline' as const,
                organization_id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18',
                last_active_at: new Date(Date.now() - 86400000).toISOString(),
                description: 'Motion detection sensor for testing'
              } as Device;
            }
          }
          
          throw error;
        }
        
        return data as Device;
      } catch (err) {
        console.error('Error in device fetch:', err);
        throw new Error(err instanceof Error ? err.message : 'Failed to fetch device');
      }
    },
    enabled: !!deviceId,
    retry: 0,
    staleTime: 1000 * 60 * 5
  });
  
  return {
    device,
    isLoading,
    error: error ? (error as Error).message : null
  };
};
