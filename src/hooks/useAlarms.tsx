
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlarmConfig, AlarmFormData } from '@/types/alarm';
import { 
  fetchAlarms, 
  createAlarm, 
  updateAlarm, 
  deleteAlarm,
  testAlarm
} from '@/services/alarms';

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
      return await fetchAlarms(organizationId);
    },
    enabled: !!organizationId,
  });

  const createAlarmMutation = useMutation({
    mutationFn: async (alarmData: AlarmFormData) => {
      if (!organizationId) throw new Error('Organization ID is required');
      return await createAlarm(organizationId, alarmData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms', organizationId] });
    }
  });

  const updateAlarmMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AlarmFormData> }) => {
      return await updateAlarm(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms', organizationId] });
    }
  });

  const deleteAlarmMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteAlarm(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms', organizationId] });
    }
  });

  const toggleAlarmMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return await updateAlarm(id, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alarms', organizationId] });
    }
  });

  const testAlarmMutation = useMutation({
    mutationFn: async (id: string) => {
      return await testAlarm(id);
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
