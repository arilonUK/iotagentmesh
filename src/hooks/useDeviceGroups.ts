
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchDeviceGroups, 
  fetchDeviceGroup,
  createDeviceGroup,
  updateDeviceGroup,
  deleteDeviceGroup,
  addDeviceToGroup,
  removeDeviceFromGroup,
  batchAddDevicesToGroup,
  batchRemoveDevicesFromGroup
} from '@/services/deviceGroupService';
import { DeviceGroupFormData } from '@/types/deviceGroup';
import { useToast } from '@/hooks/use-toast';

export const useDeviceGroups = (organizationId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    data: deviceGroups = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['deviceGroups', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return fetchDeviceGroups(organizationId);
    },
    enabled: !!organizationId
  });
  
  const createGroupMutation = useMutation({
    mutationFn: (groupData: DeviceGroupFormData) => {
      if (!organizationId) {
        throw new Error('No organization selected');
      }
      return createDeviceGroup(organizationId, groupData);
    },
    onSuccess: () => {
      toast({
        title: "Group created",
        description: "Device group has been created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['deviceGroups'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create group: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, data }: { groupId: string, data: DeviceGroupFormData }) => 
      updateDeviceGroup(groupId, data),
    onSuccess: () => {
      toast({
        title: "Group updated",
        description: "Device group has been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['deviceGroups'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update group: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) => deleteDeviceGroup(groupId),
    onSuccess: () => {
      toast({
        title: "Group deleted",
        description: "Device group has been deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['deviceGroups'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete group: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  const addToGroupMutation = useMutation({
    mutationFn: ({ deviceId, groupId }: { deviceId: string, groupId: string }) => 
      addDeviceToGroup(deviceId, groupId),
    onSuccess: () => {
      toast({
        title: "Device added",
        description: "Device has been added to the group"
      });
      queryClient.invalidateQueries({ queryKey: ['deviceGroups'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add device to group: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  const removeFromGroupMutation = useMutation({
    mutationFn: ({ deviceId, groupId }: { deviceId: string, groupId: string }) => 
      removeDeviceFromGroup(deviceId, groupId),
    onSuccess: () => {
      toast({
        title: "Device removed",
        description: "Device has been removed from the group"
      });
      queryClient.invalidateQueries({ queryKey: ['deviceGroups'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove device from group: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  const batchAddToGroupMutation = useMutation({
    mutationFn: ({ deviceIds, groupId }: { deviceIds: string[], groupId: string }) => 
      batchAddDevicesToGroup(deviceIds, groupId),
    onSuccess: () => {
      toast({
        title: "Devices added",
        description: "Selected devices have been added to the group"
      });
      queryClient.invalidateQueries({ queryKey: ['deviceGroups'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add devices to group: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  const batchRemoveFromGroupMutation = useMutation({
    mutationFn: ({ deviceIds, groupId }: { deviceIds: string[], groupId: string }) => 
      batchRemoveDevicesFromGroup(deviceIds, groupId),
    onSuccess: () => {
      toast({
        title: "Devices removed",
        description: "Selected devices have been removed from the group"
      });
      queryClient.invalidateQueries({ queryKey: ['deviceGroups'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove devices from group: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  return {
    deviceGroups,
    isLoading,
    error,
    refetch,
    createGroup: createGroupMutation.mutate,
    updateGroup: updateGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    addToGroup: addToGroupMutation.mutate,
    removeFromGroup: removeFromGroupMutation.mutate,
    batchAddToGroup: batchAddToGroupMutation.mutate,
    batchRemoveFromGroup: batchRemoveFromGroupMutation.mutate,
    isCreating: createGroupMutation.isPending,
    isUpdating: updateGroupMutation.isPending,
    isDeleting: deleteGroupMutation.isPending
  };
};

export const useDeviceGroup = (groupId?: string) => {
  const {
    data: group,
    isLoading,
    error
  } = useQuery({
    queryKey: ['deviceGroup', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      return fetchDeviceGroup(groupId);
    },
    enabled: !!groupId
  });
  
  return {
    group,
    isLoading,
    error
  };
};
