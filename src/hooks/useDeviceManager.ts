
import { useState } from 'react';
import { Device } from '@/types/device';
import { createDevice, updateDevice, deleteDevice } from '@/services/deviceService';
import { useDevices } from '@/hooks/useDevices';
import { toast } from '@/components/ui/use-toast';

export const useDeviceManager = (organizationId?: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { devices, isLoading, refetch } = useDevices(organizationId);

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
      
      const newDevice = await createDevice({
        ...deviceData,
        organization_id: organizationId
      });
      
      if (newDevice) {
        toast({
          title: "Success",
          description: "Device created successfully",
        });
        refetch();
        return newDevice;
      }
      
      return null;
    } catch (error) {
      console.error('Error in handleCreateDevice:', error);
      toast({
        title: "Error",
        description: "Failed to create device",
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
      
      const updated = await updateDevice(id, deviceData);
      
      if (updated) {
        toast({
          title: "Success",
          description: "Device updated successfully",
        });
        refetch();
        return updated;
      }
      
      return null;
    } catch (error) {
      console.error('Error in handleUpdateDevice:', error);
      toast({
        title: "Error",
        description: "Failed to update device",
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
      
      const success = await deleteDevice(id);
      
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
        description: "Failed to delete device",
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
