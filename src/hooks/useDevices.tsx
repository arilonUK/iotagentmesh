
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { fetchDevices, fetchDevice } from '@/services/deviceService';
import { supabase } from '@/integrations/supabase/client';

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
      return await fetchDevices(organizationId);
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
    error,
    refetch
  } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      return await fetchDevice(deviceId);
    },
    enabled: !!deviceId,
    retry: 1,
    staleTime: 1000 * 60 * 5
  });
  
  return {
    device,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
};
