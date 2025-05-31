
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
}

interface ContextFactoryValue extends ContextFactoryState {
  getContext: <T>(type: ContextType) => T | null;
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
        factory: async () => createQueryClient(),
        dependencies: [],
        lazy: false,
        state: InitializationState.PENDING,
      },
      {
        type: ContextType.TOAST,
        factory: async () => ({}), // Toast context is lightweight
        dependencies: [],
        lazy: false,
        state: InitializationState.PENDING,
      },
      {
        type: ContextType.AUTH,
        factory: async () => ({}), // Auth will be handled by AuthContextManager
        dependencies: [ContextType.QUERY_CLIENT],
        lazy: false,
        state: InitializationState.PENDING,
      },
      {
        type: ContextType.ORGANIZATION,
        factory: async () => ({}), // Organization context
        dependencies: [ContextType.AUTH],
        lazy: true,
        state: InitializationState.PENDING,
      },
      {
        type: ContextType.NOTIFICATION,
        factory: async () => ({}), // Notification context
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
      globalState: InitializationState.LOADING,
    }));
  }, []);

  const getContext = useCallback(function<T>(type: ContextType): T | null {
    const registration = state.contexts.get(type);
    return registration?.instance || null;
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
    const registration = state.contexts.get(type);
    if (!registration || registration.state === InitializationState.READY) {
      return;
    }

    try {
      // Check dependencies first
      for (const dep of registration.dependencies) {
        const depRegistration = state.contexts.get(dep);
        if (depRegistration?.state !== InitializationState.READY) {
          throw new Error(`Dependency ${dep} not ready for ${type}`);
        }
      }

      setState(prev => {
        const newContexts = new Map(prev.contexts);
        const reg = newContexts.get(type)!;
        reg.state = InitializationState.LOADING;
        return { ...prev, contexts: newContexts };
      });

      const instance = await registration.factory();

      setState(prev => {
        const newContexts = new Map(prev.contexts);
        const reg = newContexts.get(type)!;
        reg.state = InitializationState.READY;
        reg.instance = instance;
        reg.error = undefined;
        return { ...prev, contexts: newContexts };
      });
    } catch (error) {
      setState(prev => {
        const newContexts = new Map(prev.contexts);
        const reg = newContexts.get(type)!;
        reg.state = InitializationState.ERROR;
        reg.error = error as Error;
        return { ...prev, contexts: newContexts };
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
          await initializeContext(contextType);
        }
      }
    }
  }, [initializeContext, state.contexts]);

  // Initialize non-lazy contexts in order
  useEffect(() => {
    const initializeNonLazyContexts = async () => {
      try {
        for (const type of state.initializationOrder) {
          const registration = state.contexts.get(type);
          if (registration && !registration.lazy) {
            await initializeContext(type);
          }
        }
        
        setState(prev => ({ ...prev, globalState: InitializationState.READY }));
      } catch (error) {
        console.error('Context initialization failed:', error);
        setState(prev => ({ ...prev, globalState: InitializationState.ERROR }));
      }
    };

    if (state.globalState === InitializationState.LOADING && state.contexts.size > 0) {
      initializeNonLazyContexts();
    }
  }, [state.globalState, state.contexts, state.initializationOrder, initializeContext]);

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
