
import { ContextRegistration, ContextType, InitializationState } from './types';
import { createQueryClient } from './queryClientFactory';
import { ServiceRegistry } from '@/services/ServiceRegistry';

export const createContextRegistrations = (): ContextRegistration[] => [
  {
    type: ContextType.QUERY_CLIENT,
    factory: async () => {
      console.log('Creating QueryClient...');
      try {
        const client = createQueryClient();
        console.log('QueryClient created successfully:', client);
        return client;
      } catch (error) {
        console.error('Failed to create QueryClient:', error);
        throw error;
      }
    },
    dependencies: [],
    lazy: false,
    state: InitializationState.PENDING,
  },
  {
    type: ContextType.TOAST,
    factory: async () => {
      console.log('Creating Toast context...');
      return { initialized: true };
    },
    dependencies: [],
    lazy: false,
    state: InitializationState.PENDING,
  },
  {
    type: ContextType.AUTH,
    factory: async () => {
      console.log('Creating Auth context...');
      return { initialized: true };
    },
    dependencies: [ContextType.QUERY_CLIENT],
    lazy: false,
    state: InitializationState.PENDING,
  },
  {
    type: ContextType.ORGANIZATION,
    factory: async () => {
      console.log('Creating Organization context...');
      
      // Initialize the modernized service registry
      await ServiceRegistry.initialize();
      console.log('Service Registry initialized in Organization context');
      
      return { 
        initialized: true,
        serviceRegistry: ServiceRegistry 
      };
    },
    dependencies: [ContextType.AUTH],
    lazy: true,
    state: InitializationState.PENDING,
  },
  {
    type: ContextType.NOTIFICATION,
    factory: async () => {
      console.log('Creating Notification context...');
      return { initialized: true };
    },
    dependencies: [ContextType.AUTH],
    lazy: true,
    state: InitializationState.PENDING,
  },
];
