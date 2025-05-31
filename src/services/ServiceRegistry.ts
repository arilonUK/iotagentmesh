
import { devicesApiService } from './api/devicesApiService';
import { alarmsApiService } from './api/alarmsApiService';
import { endpointsApiService } from './api/endpointsApiService';

/**
 * Central registry for all domain services
 * Provides consistent access to standardized API services
 */
export class ServiceRegistry {
  // Domain services
  static readonly devices = devicesApiService;
  static readonly alarms = alarmsApiService;
  static readonly endpoints = endpointsApiService;

  /**
   * Get all available services
   */
  static getAllServices() {
    return {
      devices: this.devices,
      alarms: this.alarms,
      endpoints: this.endpoints
    };
  }

  /**
   * Check if a service is available
   */
  static hasService(serviceName: string): boolean {
    return serviceName in this.getAllServices();
  }

  /**
   * Get service by name
   */
  static getService(serviceName: string) {
    const services = this.getAllServices();
    return services[serviceName as keyof typeof services];
  }
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry;
