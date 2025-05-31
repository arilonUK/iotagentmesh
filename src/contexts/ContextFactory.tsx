
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { Session, User } from '@supabase/supabase-js';

// Context factory pattern with lazy loading
export enum ContextType {
  QUERY_CLIENT = 'queryClient',
  AUTH = 'auth',
  ORGANIZATION = 'organization',
  NOTIFICATION = 'notification',
  TOAST = 'toast'
}

export enum InitializationState {
  PENDING = 'pending',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error'
}

interface ContextRegistration {
  type: ContextType;
  factory: () => Promise<any>;
  dependencies: ContextType[];
  lazy: boolean;
  state: InitializationState;
  instance?: any;
  error?: Error;
}

interface ContextFactoryState {
  contexts: Map<ContextType, ContextRegistration>;
  initializationOrder: ContextType[];
  globalState: InitializationState;
  session: Session | null;
  user: User | null;
  error?: Error;
}

interface ContextFactoryValue extends ContextFactoryState {
  getContext: <T = any>(type: ContextType) => T | null;
  isReady: (type: ContextType) => boolean;
  getError: (type: ContextType) => Error | null;
  setSession: (session: Session | null) => void;
  retryInitialization: (type?: ContextType) => Promise<void>;
}

const ContextFactoryContext = createContext<ContextFactoryValue | undefined>(undefined);

export const useContextFactory = () => {
  const context = useContext(ContextFactoryContext);
  if (!context) {
    throw new Error('useContextFactory must be used within ContextFactoryProvider');
  }
  return context;
};

// Create singleton query client
let globalQueryClient: QueryClient | null = null;

const createQueryClient = () => {
  if (!globalQueryClient) {
    globalQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          retry: (failureCount, error: any) => {
            if (error?.status >= 400 && error?.status < 500) {
              return false;
            }
            return failureCount < 3;
          },
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
        },
        mutations: {
          retry: false,
        },
      },
    });
  }
  return globalQueryClient;
};

export const ContextFactoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ContextFactoryState>({
    contexts: new Map(),
    initializationOrder: [
      ContextType.QUERY_CLIENT,
      ContextType.TOAST,
      ContextType.AUTH,
      ContextType.ORGANIZATION,
      ContextType.NOTIFICATION
    ],
    globalState: InitializationState.PENDING,
    session: null,
    user: null,
  });

  // Register context factories
  useEffect(() => {
    const contextRegistrations: ContextRegistration[] = [
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
          return { initialized: true }; // Toast context is lightweight
        },
        dependencies: [],
        lazy: false,
        state: InitializationState.PENDING,
      },
      {
        type: ContextType.AUTH,
        factory: async () => {
          console.log('Creating Auth context...');
          return { initialized: true }; // Auth will be handled by AuthContextManager
        },
        dependencies: [ContextType.QUERY_CLIENT],
        lazy: false,
        state: InitializationState.PENDING,
      },
      {
        type: ContextType.ORGANIZATION,
        factory: async () => {
          console.log('Creating Organization context...');
          return { initialized: true }; // Organization context
        },
        dependencies: [ContextType.AUTH],
        lazy: true,
        state: InitializationState.PENDING,
      },
      {
        type: ContextType.NOTIFICATION,
        factory: async () => {
          console.log('Creating Notification context...');
          return { initialized: true }; // Notification context
        },
        dependencies: [ContextType.AUTH],
        lazy: true,
        state: InitializationState.PENDING,
      },
    ];

    const contextMap = new Map();
    contextRegistrations.forEach(reg => contextMap.set(reg.type, reg));

    setState(prev => ({
      ...prev,
      contexts: contextMap,
    }));
  }, []);

  const getContext = useCallback(<T = any>(type: ContextType): T | null => {
    const registration = state.contexts.get(type);
    if (!registration || registration.state !== InitializationState.READY) {
      return null;
    }
    return registration.instance as T;
  }, [state.contexts]);

  const isReady = useCallback((type: ContextType): boolean => {
    const registration = state.contexts.get(type);
    return registration?.state === InitializationState.READY;
  }, [state.contexts]);

  const getError = useCallback((type: ContextType): Error | null => {
    const registration = state.contexts.get(type);
    return registration?.error || null;
  }, [state.contexts]);

  const setSession = useCallback((session: Session | null) => {
    setState(prev => ({
      ...prev,
      session,
      user: session?.user ?? null,
    }));
  }, []);

  const initializeContext = useCallback(async (type: ContextType): Promise<void> => {
    console.log(`Starting initialization for context: ${type}`);
    
    const registration = state.contexts.get(type);
    if (!registration) {
      throw new Error(`Context ${type} not found`);
    }

    if (registration.state === InitializationState.READY) {
      console.log(`Context ${type} already ready`);
      return;
    }

    try {
      // Check dependencies first
      for (const dep of registration.dependencies) {
        const depRegistration = state.contexts.get(dep);
        if (!depRegistration || depRegistration.state !== InitializationState.READY) {
          throw new Error(`Dependency ${dep} not ready for ${type}`);
        }
      }

      // Update state to loading
      setState(prev => {
        const newContexts = new Map(prev.contexts);
        const reg = { ...newContexts.get(type)! };
        reg.state = InitializationState.LOADING;
        reg.error = undefined;
        newContexts.set(type, reg);
        return { ...prev, contexts: newContexts };
      });

      const instance = await registration.factory();
      console.log(`Context ${type} initialized successfully:`, instance);

      // Update state to ready
      setState(prev => {
        const newContexts = new Map(prev.contexts);
        const reg = { ...newContexts.get(type)! };
        reg.state = InitializationState.READY;
        reg.instance = instance;
        reg.error = undefined;
        newContexts.set(type, reg);
        return { ...prev, contexts: newContexts };
      });
    } catch (error) {
      console.error(`Failed to initialize context ${type}:`, error);
      
      // Update state to error
      setState(prev => {
        const newContexts = new Map(prev.contexts);
        const reg = { ...newContexts.get(type)! };
        reg.state = InitializationState.ERROR;
        reg.error = error as Error;
        newContexts.set(type, reg);
        return { ...prev, contexts: newContexts, error: error as Error };
      });
      throw error;
    }
  }, [state.contexts]);

  const retryInitialization = useCallback(async (type?: ContextType): Promise<void> => {
    if (type) {
      await initializeContext(type);
    } else {
      // Retry all failed contexts
      for (const [contextType, registration] of state.contexts) {
        if (registration.state === InitializationState.ERROR) {
          try {
            await initializeContext(contextType);
          } catch (error) {
            console.error(`Retry failed for ${contextType}:`, error);
          }
        }
      }
    }
  }, [initializeContext, state.contexts]);

  // Initialize non-lazy contexts in order
  useEffect(() => {
    if (state.contexts.size === 0) {
      return;
    }

    const initializeNonLazyContexts = async () => {
      try {
        console.log('Starting context initialization...');
        setState(prev => ({ ...prev, globalState: InitializationState.LOADING }));
        
        for (const type of state.initializationOrder) {
          const registration = state.contexts.get(type);
          if (registration && !registration.lazy) {
            await initializeContext(type);
          }
        }
        
        console.log('All non-lazy contexts initialized successfully');
        setState(prev => ({ ...prev, globalState: InitializationState.READY }));
      } catch (error) {
        console.error('Context initialization failed:', error);
        setState(prev => ({ 
          ...prev, 
          globalState: InitializationState.ERROR,
          error: error as Error
        }));
      }
    };

    if (state.globalState === InitializationState.PENDING) {
      initializeNonLazyContexts();
    }
  }, [state.contexts, state.globalState, initializeContext, state.initializationOrder]);

  const value: ContextFactoryValue = {
    ...state,
    getContext,
    isReady,
    getError,
    setSession,
    retryInitialization,
  };

  return (
    <ContextFactoryContext.Provider value={value}>
      {children}
    </ContextFactoryContext.Provider>
  );
};
