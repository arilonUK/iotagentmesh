
import { modernizedServiceRegistry } from '../registry/ModernizedServiceRegistry';

/**
 * Bridge to maintain backward compatibility with legacy service patterns
 * This allows existing code to continue working while we migrate to the new pattern
 */
export class LegacyServiceBridge {
  /**
   * Get legacy-style device service
   */
  static getDeviceService() {
    return {
      async fetchDevices() {
        return modernizedServiceRegistry.devices.fetchAll();
      },
      async fetchDevice(id: string) {
        return modernizedServiceRegistry.devices.fetchById(id);
      },
      async createDevice(data: any) {
        return modernizedServiceRegistry.devices.create(data);
      },
      async updateDevice(id: string, data: any) {
        return modernizedServiceRegistry.devices.update(id, data);
      },
      async deleteDevice(id: string) {
        return modernizedServiceRegistry.devices.delete(id);
      }
    };
  }

  /**
   * Get legacy-style alarm service
   */
  static getAlarmService() {
    return {
      async getAlarms() {
        return modernizedServiceRegistry.alarms.fetchAll();
      },
      async createAlarm(data: any) {
        return modernizedServiceRegistry.alarms.create(data);
      },
      async updateAlarm(id: string, data: any) {
        return modernizedServiceRegistry.alarms.update(id, data);
      },
      async deleteAlarm(id: string) {
        return modernizedServiceRegistry.alarms.delete(id);
      },
      async testAlarm(id: string) {
        return modernizedServiceRegistry.alarms.testAlarm(id);
      }
    };
  }

  /**
   * Get legacy-style endpoint service
   */
  static getEndpointService() {
    return {
      async fetchEndpoints() {
        return modernizedServiceRegistry.endpoints.fetchAll();
      },
      async createEndpoint(data: any) {
        return modernizedServiceRegistry.endpoints.create(data);
      },
      async updateEndpoint(id: string, data: any) {
        return modernizedServiceRegistry.endpoints.update(id, data);
      },
      async deleteEndpoint(id: string) {
        return modernizedServiceRegistry.endpoints.delete(id);
      },
      async triggerEndpoint(id: string, payload?: any) {
        return modernizedServiceRegistry.endpoints.triggerEndpoint(id, payload);
      }
    };
  }
}
