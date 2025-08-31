import { devicesApiService, CreateDeviceRequest as LocalCreateDeviceRequest, UpdateDeviceRequest as LocalUpdateDeviceRequest } from './devicesApiService';
import { iotAgentMeshApiService, CreateDeviceRequest as MeshCreateDeviceRequest, UpdateDeviceRequest as MeshUpdateDeviceRequest, IoTDevice } from './iotAgentMeshApiService';
import { Device } from '@/types/device';
import { toast } from 'sonner';

export interface IntegratedDevice extends Device {
  mesh_device_id?: string;
  mesh_agent_id?: string;
  sync_status: 'synced' | 'pending' | 'failed' | 'local_only';
  last_sync_at?: string;
  mesh_status?: 'active' | 'inactive' | 'error';
  telemetry_enabled?: boolean;
}

export interface CreateIntegratedDeviceRequest extends LocalCreateDeviceRequest {
  mesh_agent_id?: string;
  enable_mesh_sync?: boolean;
  telemetry_config?: {
    interval: number;
    metrics: string[];
  };
}

export interface UpdateIntegratedDeviceRequest extends LocalUpdateDeviceRequest {
  mesh_agent_id?: string;
  enable_mesh_sync?: boolean;
  telemetry_config?: {
    interval: number;
    metrics: string[];
  };
}

export class IntegratedDeviceService {
  private readonly localService = devicesApiService;
  private readonly meshService = iotAgentMeshApiService;

  async fetchAll(): Promise<IntegratedDevice[]> {
    try {
      console.log('Fetching integrated devices from both local and mesh services');
      
      // Fetch devices from local service
      const localDevices = await this.localService.fetchAll();
      
      // Try to fetch devices from mesh service (may fail if not configured)
      let meshDevices: IoTDevice[] = [];
      try {
        meshDevices = await this.meshService.getDevices();
      } catch (error) {
        console.warn('Mesh service not available:', error);
      }

      // Create a map of mesh devices by their local device reference
      const meshDeviceMap = new Map<string, IoTDevice>();
      meshDevices.forEach(meshDevice => {
        // Assuming mesh devices have a property linking back to local device ID
        if (meshDevice.properties?.local_device_id) {
          meshDeviceMap.set(meshDevice.properties.local_device_id as string, meshDevice);
        }
      });

      // Merge local and mesh device data
      const integratedDevices: IntegratedDevice[] = localDevices.map(localDevice => {
        const meshDevice = meshDeviceMap.get(localDevice.id);
        
        return {
          ...localDevice,
          mesh_device_id: meshDevice?.id,
          mesh_agent_id: meshDevice?.agent_id,
          sync_status: meshDevice ? 'synced' : 'local_only',
          last_sync_at: meshDevice?.updated_at,
          mesh_status: meshDevice?.status,
          telemetry_enabled: !!meshDevice?.telemetry_config
        };
      });

      console.log(`Fetched ${integratedDevices.length} integrated devices`);
      return integratedDevices;
    } catch (error) {
      console.error('Error fetching integrated devices:', error);
      // Fallback to local devices only
      const localDevices = await this.localService.fetchAll();
      return localDevices.map(device => ({
        ...device,
        sync_status: 'local_only' as const
      }));
    }
  }

  async fetchById(id: string): Promise<IntegratedDevice | null> {
    try {
      const localDevice = await this.localService.fetchById(id);
      if (!localDevice) return null;

      // Try to find corresponding mesh device
      let meshDevice: IoTDevice | null = null;
      try {
        const meshDevices = await this.meshService.getDevices();
        meshDevice = meshDevices.find(d => d.properties?.local_device_id as string === id) || null;
      } catch (error) {
        console.warn('Mesh service not available for device fetch:', error);
      }

      return {
        ...localDevice,
        mesh_device_id: meshDevice?.id,
        mesh_agent_id: meshDevice?.agent_id,
        sync_status: meshDevice ? 'synced' : 'local_only',
        last_sync_at: meshDevice?.updated_at,
        mesh_status: meshDevice?.status,
        telemetry_enabled: !!meshDevice?.telemetry_config
      };
    } catch (error) {
      console.error('Error fetching integrated device:', error);
      return null;
    }
  }

  async create(data: CreateIntegratedDeviceRequest): Promise<IntegratedDevice> {
    try {
      console.log('Creating integrated device:', data);
      
      // Create device locally first
      const localDevice = await this.localService.create({
        name: data.name,
        type: data.type,
        status: data.status,
        description: data.description,
        product_template_id: data.product_template_id
      });

      let meshDevice: IoTDevice | null = null;
      let syncStatus: IntegratedDevice['sync_status'] = 'local_only';

      // If mesh sync is enabled and agent is specified, create in mesh
      if (data.enable_mesh_sync && data.mesh_agent_id) {
        try {
          const meshCreateData: MeshCreateDeviceRequest = {
            agent_id: data.mesh_agent_id,
            name: data.name,
            type: data.type,
          properties: {
            local_device_id: localDevice.id,
            description: data.description || localDevice.description
          },
            telemetry_config: data.telemetry_config
          };

          meshDevice = await this.meshService.createDevice(meshCreateData);
          syncStatus = 'synced';
          toast.success('Device created and synced to IoT Agent Mesh');
        } catch (meshError) {
          console.error('Failed to create device in mesh:', meshError);
          syncStatus = 'failed';
          toast.warning('Device created locally but failed to sync to IoT Agent Mesh');
        }
      } else {
        toast.success('Device created locally');
      }

      return {
        ...localDevice,
        mesh_device_id: meshDevice?.id,
        mesh_agent_id: meshDevice?.agent_id,
        sync_status: syncStatus,
        last_sync_at: meshDevice?.updated_at,
        mesh_status: meshDevice?.status,
        telemetry_enabled: !!meshDevice?.telemetry_config
      };
    } catch (error) {
      console.error('Error creating integrated device:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateIntegratedDeviceRequest): Promise<IntegratedDevice> {
    try {
      console.log(`Updating integrated device ${id}:`, data);
      
      // Update local device
      const localDevice = await this.localService.update(id, {
        name: data.name,
        type: data.type,
        status: data.status,
        description: data.description,
        product_template_id: data.product_template_id
      });

      // Get current integrated device to check mesh status
      const currentDevice = await this.fetchById(id);
      let meshDevice: IoTDevice | null = null;
      let syncStatus: IntegratedDevice['sync_status'] = currentDevice?.sync_status || 'local_only';

      // Update mesh device if it exists or if sync is being enabled
      if (currentDevice?.mesh_device_id || (data.enable_mesh_sync && data.mesh_agent_id)) {
        try {
          if (currentDevice?.mesh_device_id) {
            // Update existing mesh device
            const meshUpdateData: MeshUpdateDeviceRequest = {
              name: data.name,
              status: data.status === 'active' ? 'active' : 'inactive',
              properties: {
                local_device_id: id,
                description: data.description,
                product_template_id: data.product_template_id
              },
              telemetry_config: data.telemetry_config
            };

            meshDevice = await this.meshService.updateDevice(currentDevice.mesh_device_id, meshUpdateData);
            syncStatus = 'synced';
          } else if (data.enable_mesh_sync && data.mesh_agent_id) {
            // Create new mesh device for previously local-only device
            const meshCreateData: MeshCreateDeviceRequest = {
              agent_id: data.mesh_agent_id,
              name: data.name || localDevice.name,
              type: data.type || localDevice.type,
              properties: {
              local_device_id: id,
              description: data.description || localDevice.description
              },
              telemetry_config: data.telemetry_config
            };

            meshDevice = await this.meshService.createDevice(meshCreateData);
            syncStatus = 'synced';
          }
          
          toast.success('Device updated and synced to IoT Agent Mesh');
        } catch (meshError) {
          console.error('Failed to update device in mesh:', meshError);
          syncStatus = 'failed';
          toast.warning('Device updated locally but failed to sync to IoT Agent Mesh');
        }
      } else {
        toast.success('Device updated locally');
      }

      return {
        ...localDevice,
        mesh_device_id: meshDevice?.id || currentDevice?.mesh_device_id,
        mesh_agent_id: meshDevice?.agent_id || currentDevice?.mesh_agent_id,
        sync_status: syncStatus,
        last_sync_at: meshDevice?.updated_at || currentDevice?.last_sync_at,
        mesh_status: meshDevice?.status || currentDevice?.mesh_status,
        telemetry_enabled: !!meshDevice?.telemetry_config || currentDevice?.telemetry_enabled
      };
    } catch (error) {
      console.error('Error updating integrated device:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      console.log(`Deleting integrated device: ${id}`);
      
      // Get device info before deletion
      const device = await this.fetchById(id);
      
      // Delete from mesh first if it exists
      if (device?.mesh_device_id) {
        try {
          // Note: Assuming mesh service has delete capability
          // Since it's not in the original interface, we'll skip this for now
          console.log('Mesh device deletion not implemented yet');
        } catch (meshError) {
          console.error('Failed to delete device from mesh:', meshError);
          toast.warning('Device deleted locally but may still exist in IoT Agent Mesh');
        }
      }

      // Delete local device
      const success = await this.localService.delete(id);
      
      if (success) {
        toast.success('Device deleted successfully');
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting integrated device:', error);
      return false;
    }
  }

  async syncToMesh(deviceId: string, agentId: string): Promise<boolean> {
    try {
      console.log(`Syncing device ${deviceId} to mesh with agent ${agentId}`);
      
      const localDevice = await this.localService.fetchById(deviceId);
      if (!localDevice) {
        throw new Error('Local device not found');
      }

      const meshCreateData: MeshCreateDeviceRequest = {
        agent_id: agentId,
        name: localDevice.name,
        type: localDevice.type,
        properties: {
          local_device_id: deviceId,
          description: localDevice.description,
          product_template_id: localDevice.product_template_id
        },
        telemetry_config: {
          interval: 30,
          metrics: ['status', 'last_active']
        }
      };

      await this.meshService.createDevice(meshCreateData);
      toast.success('Device successfully synced to IoT Agent Mesh');
      return true;
    } catch (error) {
      console.error('Error syncing device to mesh:', error);
      toast.error('Failed to sync device to IoT Agent Mesh');
      return false;
    }
  }

  async unsyncFromMesh(deviceId: string): Promise<boolean> {
    try {
      console.log(`Unsyncing device ${deviceId} from mesh`);
      
      const device = await this.fetchById(deviceId);
      if (!device?.mesh_device_id) {
        toast.warning('Device is not synced to mesh');
        return false;
      }

      // Note: Mesh service delete not implemented yet
      toast.info('Mesh unsync functionality will be available soon');
      return true;
    } catch (error) {
      console.error('Error unsyncing device from mesh:', error);
      toast.error('Failed to unsync device from IoT Agent Mesh');
      return false;
    }
  }

  async refreshMeshStatus(deviceId: string): Promise<IntegratedDevice | null> {
    try {
      const device = await this.fetchById(deviceId);
      if (!device?.mesh_device_id) {
        return device;
      }

      // Refresh device status from mesh
      const meshDevices = await this.meshService.getDevices();
      const meshDevice = meshDevices.find(d => d.id === device.mesh_device_id);

      if (meshDevice) {
        const updatedDevice: IntegratedDevice = {
          ...device,
          sync_status: 'synced',
          last_sync_at: new Date().toISOString(),
          mesh_status: meshDevice.status,
          telemetry_enabled: !!meshDevice.telemetry_config
        };
        
        return updatedDevice;
      }

      return device;
    } catch (error) {
      console.error('Error refreshing mesh status:', error);
      return null;
    }
  }
}

export const integratedDeviceService = new IntegratedDeviceService();