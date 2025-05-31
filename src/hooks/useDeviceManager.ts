
import { useState } from 'react';
import { Device } from '@/types/device';
import { deviceApiService, CreateDeviceRequest, UpdateDeviceRequest } from '@/services/deviceApiService';
import { useDevices } from '@/hooks/useDevices';
import { useToast } from '@/hooks/use-toast';

export const useDeviceManager = (organizationId?: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { devices, isLoading, refetch } = useDevices(organizationId);
  const { toast } = useToast();

  const handleCreateDevice = async (deviceData: Omit<Device, 'id' | 'last_active_at'>) => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsCreating(true);
      
      const createRequest: CreateDeviceRequest = {
        name: deviceData.name,
        type: deviceData.type,
        status: deviceData.status,
        description: deviceData.description
      };
      
      const newDevice = await deviceApiService.createDevice(createRequest);
      
      toast({
        title: "Success",
        description: "Device created successfully",
      });
      refetch();
      return newDevice;
    } catch (error) {
      console.error('Error in handleCreateDevice:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create device",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateDevice = async (id: string, deviceData: Partial<Device>) => {
    try {
      setIsUpdating(true);
      
      const updateRequest: UpdateDeviceRequest = {
        name: deviceData.name,
        type: deviceData.type,
        status: deviceData.status,
        description: deviceData.description
      };
      
      const updated = await deviceApiService.updateDevice(id, updateRequest);
      
      toast({
        title: "Success",
        description: "Device updated successfully",
      });
      refetch();
      return updated;
    } catch (error) {
      console.error('Error in handleUpdateDevice:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update device",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      setIsDeleting(true);
      
      const success = await deviceApiService.deleteDevice(id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Device deleted successfully",
        });
        refetch();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in handleDeleteDevice:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete device",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    devices,
    isLoading: isLoading || isCreating || isUpdating || isDeleting,
    isCreating,
    isUpdating,
    isDeleting,
    createDevice: handleCreateDevice,
    updateDevice: handleUpdateDevice,
    deleteDevice: handleDeleteDevice,
    refetchDevices: refetch
  };
};
