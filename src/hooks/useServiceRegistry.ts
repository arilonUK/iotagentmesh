
import { devicesApiService } from '@/services/api/devicesApiService';
import { alarmsApiService } from '@/services/api/alarmsApiService';
import { endpointsApiService } from '@/services/api/endpointsApiService';

/**
 * Simple hook to access services directly
 * No complex registry or initialization needed
 */
export const useServices = () => {
  return {
    devices: devicesApiService,
    alarms: alarmsApiService,
    endpoints: endpointsApiService
  };
};

// Backward compatibility
export const useServiceRegistry = () => {
  const services = useServices();
  
  return {
    isInitialized: true, // Always initialized since services are direct imports
    services: {
      getService: (name: string) => {
        switch (name) {
          case 'devices':
            return services.devices;
          case 'alarms':
            return services.alarms;
          case 'endpoints':
            return services.endpoints;
          default:
            throw new Error(`Service '${name}' not found`);
        }
      },
      ...services
    },
    error: null
  };
};

/**
 * Hook to get specific service with type safety
 */
export const useService = <T>(serviceName: string): T | null => {
  const services = useServices();
  
  try {
    switch (serviceName) {
      case 'devices':
        return services.devices as T;
      case 'alarms':
        return services.alarms as T;
      case 'endpoints':
        return services.endpoints as T;
      default:
        console.error(`Service ${serviceName} not found`);
        return null;
    }
  } catch (error) {
    console.error(`Failed to get service ${serviceName}:`, error);
    return null;
  }
};
