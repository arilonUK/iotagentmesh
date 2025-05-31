
import { modernizedServiceRegistry } from './registry/ModernizedServiceRegistry';
import { LegacyServiceBridge } from './legacy/LegacyServiceBridge';

/**
 * Updated Service Registry that bridges legacy and modernized patterns
 * Provides consistent access to standardized API services
 */
export class ServiceRegistry {
  private static initialized = false;

  /**
   * Initialize the service registry
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing Service Registry...');
    await modernizedServiceRegistry.initialize();
    this.initialized = true;
    console.log('Service Registry initialized successfully');
  }

  /**
   * Get modernized devices service
   */
  static get devices() {
    if (!this.initialized) {
      console.warn('Service Registry not initialized, returning legacy bridge');
      return LegacyServiceBridge.getDeviceService();
    }
    return modernizedServiceRegistry.devices;
  }

  /**
   * Get modernized alarms service
   */
  static get alarms() {
    if (!this.initialized) {
      console.warn('Service Registry not initialized, returning legacy bridge');
      return LegacyServiceBridge.getAlarmService();
    }
    return modernizedServiceRegistry.alarms;
  }

  /**
   * Get modernized endpoints service
   */
  static get endpoints() {
    if (!this.initialized) {
      console.warn('Service Registry not initialized, returning legacy bridge');
      return LegacyServiceBridge.getEndpointService();
    }
    return modernizedServiceRegistry.endpoints;
  }

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
    const services = this.getAllServices();
    return serviceName in services;
  }

  /**
   * Get service by name
   */
  static getService(serviceName: string) {
    const services = this.getAllServices();
    return services[serviceName as keyof typeof services];
  }

  /**
   * Check if registry is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Destroy all services
   */
  static async destroy(): Promise<void> {
    if (!this.initialized) return;
    
    await modernizedServiceRegistry.destroy();
    this.initialized = false;
    console.log('Service Registry destroyed');
  }
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry;
