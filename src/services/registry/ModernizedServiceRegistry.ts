
import { ModernizedDevicesApiService } from '../api/modernized/DevicesApiService';
import { ModernizedAlarmsApiService } from '../api/modernized/AlarmsApiService';
import { ModernizedEndpointsApiService } from '../api/modernized/EndpointsApiService';
import { serviceLifecycleManager } from '../base/ServiceLifecycleManager';
import { ServiceDependencies } from '../base/types';

/**
 * Modernized Service Registry with dependency injection and lifecycle management
 */
export class ModernizedServiceRegistry {
  private static instance: ModernizedServiceRegistry;
  private services = new Map<string, any>();
  private initialized = false;

  private constructor() {}

  static getInstance(): ModernizedServiceRegistry {
    if (!ModernizedServiceRegistry.instance) {
      ModernizedServiceRegistry.instance = new ModernizedServiceRegistry();
    }
    return ModernizedServiceRegistry.instance;
  }

  /**
   * Initialize all services with their dependencies
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing Modernized Service Registry...');

    // Register services with their dependencies
    const dependencies: ServiceDependencies = {};

    // Create service instances
    const devicesService = new ModernizedDevicesApiService(dependencies);
    const alarmsService = new ModernizedAlarmsApiService(dependencies);
    const endpointsService = new ModernizedEndpointsApiService(dependencies);

    // Register with lifecycle manager
    serviceLifecycleManager.register('devices', devicesService, []);
    serviceLifecycleManager.register('alarms', alarmsService, []);
    serviceLifecycleManager.register('endpoints', endpointsService, []);

    // Store references
    this.services.set('devices', devicesService);
    this.services.set('alarms', alarmsService);
    this.services.set('endpoints', endpointsService);

    // Initialize all services
    await serviceLifecycleManager.initializeAll();

    this.initialized = true;
    console.log('Modernized Service Registry initialized successfully');
  }

  /**
   * Get a service by name with proper typing
   */
  getService<T>(name: string): T {
    if (!this.initialized) {
      throw new Error('Service registry not initialized. Call initialize() first.');
    }

    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found in registry`);
    }

    return service as T;
  }

  /**
   * Get devices service
   */
  get devices(): ModernizedDevicesApiService {
    return this.getService<ModernizedDevicesApiService>('devices');
  }

  /**
   * Get alarms service
   */
  get alarms(): ModernizedAlarmsApiService {
    return this.getService<ModernizedAlarmsApiService>('alarms');
  }

  /**
   * Get endpoints service
   */
  get endpoints(): ModernizedEndpointsApiService {
    return this.getService<ModernizedEndpointsApiService>('endpoints');
  }

  /**
   * Check if a service exists
   */
  hasService(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all available service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Destroy all services
   */
  async destroy(): Promise<void> {
    if (!this.initialized) return;

    await serviceLifecycleManager.destroyAll();
    this.services.clear();
    this.initialized = false;
    console.log('Modernized Service Registry destroyed');
  }

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const modernizedServiceRegistry = ModernizedServiceRegistry.getInstance();
