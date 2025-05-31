
import { useEffect, useState } from 'react';
import { ServiceRegistry } from '@/services/ServiceRegistry';
import { modernizedServiceRegistry } from '@/services/registry/ModernizedServiceRegistry';

export interface UseServiceRegistryResult {
  isInitialized: boolean;
  services: typeof ServiceRegistry;
  error: string | null;
}

/**
 * Hook to access the modernized service registry
 */
export const useServiceRegistry = (): UseServiceRegistryResult => {
  const [isInitialized, setIsInitialized] = useState(ServiceRegistry.isInitialized());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeServices = async () => {
      if (ServiceRegistry.isInitialized()) {
        setIsInitialized(true);
        return;
      }

      try {
        console.log('Initializing Service Registry from hook...');
        await ServiceRegistry.initialize();
        setIsInitialized(true);
        setError(null);
        console.log('Service Registry initialized successfully from hook');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize services';
        console.error('Failed to initialize Service Registry:', errorMessage);
        setError(errorMessage);
        setIsInitialized(false);
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      // Only destroy if we're the last consumer
      // In a real app, you might want more sophisticated lifecycle management
    };
  }, []);

  return {
    isInitialized,
    services: ServiceRegistry,
    error
  };
};

/**
 * Hook to get specific service with type safety
 */
export const useService = <T>(serviceName: string): T | null => {
  const { isInitialized, services } = useServiceRegistry();
  
  if (!isInitialized) {
    return null;
  }

  try {
    return services.getService(serviceName) as T;
  } catch (error) {
    console.error(`Failed to get service ${serviceName}:`, error);
    return null;
  }
};
