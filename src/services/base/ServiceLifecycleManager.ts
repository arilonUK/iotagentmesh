
import { ServiceLifecycle } from './types';

export class ServiceLifecycleManager {
  private services = new Map<string, ServiceLifecycle>();
  private initializationOrder: string[] = [];
  private initialized = false;

  register(name: string, service: ServiceLifecycle, dependencies: string[] = []): void {
    this.services.set(name, service);
    
    // Simple dependency ordering - dependencies must be registered first
    const insertIndex = dependencies.length > 0 
      ? Math.max(...dependencies.map(dep => this.initializationOrder.indexOf(dep))) + 1
      : this.initializationOrder.length;
    
    this.initializationOrder.splice(insertIndex, 0, name);
  }

  async initializeAll(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing services in order:', this.initializationOrder);
    
    for (const serviceName of this.initializationOrder) {
      const service = this.services.get(serviceName);
      if (service && !service.isInitialized()) {
        console.log(`Initializing service: ${serviceName}`);
        await service.initialize();
      }
    }
    
    this.initialized = true;
    console.log('All services initialized successfully');
  }

  async destroyAll(): Promise<void> {
    // Destroy in reverse order
    const reverseOrder = [...this.initializationOrder].reverse();
    
    for (const serviceName of reverseOrder) {
      const service = this.services.get(serviceName);
      if (service && service.isInitialized()) {
        console.log(`Destroying service: ${serviceName}`);
        await service.destroy();
      }
    }
    
    this.initialized = false;
    console.log('All services destroyed');
  }

  getService<T extends ServiceLifecycle>(name: string): T | null {
    return (this.services.get(name) as T) || null;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const serviceLifecycleManager = new ServiceLifecycleManager();
