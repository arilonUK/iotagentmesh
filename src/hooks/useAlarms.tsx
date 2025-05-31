
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlarmConfig, AlarmFormData } from '@/types/alarm';
import { alarmsApiService } from '@/services/api/alarmsApiService';

export const useAlarms = (organizationId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: alarms = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['alarms', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return await alarmsApiService.fetchAll();
    },
    enabled: !!organizationId,
  });

  const createAlarmMutation = useMutation({
    mutationFn: async (alarmData: AlarmFormData) => {
      if (!organizationId) throw new Error('Organization ID is required');
      return await alarmsApiService.create(alarmData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms', organizationId] });
    }
  });

  const updateAlarmMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AlarmFormData> }) => {
      return await alarmsApiService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms', organizationId] });
    }
  });

  const deleteAlarmMutation = useMutation({
    mutationFn: async (id: string) => {
      return await alarmsApiService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms', organizationId] });
    }
  });

  const toggleAlarmMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return await alarmsApiService.update(id, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms', organizationId] });
    }
  });

  const testAlarmMutation = useMutation({
    mutationFn: async (id: string) => {
      return await alarmsApiService.testAlarm(id);
    }
  });

  return {
    alarms,
    isLoading,
    error,
    refetch,
    createAlarm: createAlarmMutation.mutate,
    updateAlarm: updateAlarmMutation.mutate,
    deleteAlarm: deleteAlarmMutation.mutate,
    toggleAlarm: toggleAlarmMutation.mutate,
    testAlarm: testAlarmMutation.mutate,
    isCreating: createAlarmMutation.isPending,
    isUpdating: updateAlarmMutation.isPending,
    isDeleting: deleteAlarmMutation.isPending,
    isTesting: testAlarmMutation.isPending
  };
};
