
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  ContextType, 
  InitializationState, 
  ContextFactoryState, 
  ContextFactoryValue 
} from './types';
import { createContextRegistrations } from './contextRegistrations';
import { createContextInitializer } from './contextInitializer';
import { createContextHooks } from './contextHooks';

const ContextFactoryContext = createContext<ContextFactoryValue | undefined>(undefined);

export const useContextFactory = () => {
  const context = useContext(ContextFactoryContext);
  if (!context) {
    throw new Error('useContextFactory must be used within ContextFactoryProvider');
  }
  return context;
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

  // Use a ref to track initialization progress
  const initializationRef = useRef<{ inProgress: boolean; completed: Set<ContextType> }>({
    inProgress: false,
    completed: new Set()
  });

  // Create context hooks
  const { getContext, isReady, getError } = createContextHooks(state);

  // Create context initializer
  const { initializeContext } = createContextInitializer(setState, initializationRef);

  // Register context factories
  useEffect(() => {
    const contextRegistrations = createContextRegistrations();
    const contextMap = new Map();
    contextRegistrations.forEach(reg => contextMap.set(reg.type, reg));

    setState(prev => ({
      ...prev,
      contexts: contextMap,
    }));
  }, []);

  const setSession = useCallback((session: Session | null) => {
    setState(prev => ({
      ...prev,
      session,
      user: session?.user ?? null,
    }));
  }, []);

  const retryInitialization = useCallback(async (type?: ContextType): Promise<void> => {
    if (type) {
      await initializeContext(type, state.contexts);
    } else {
      // Reset and retry all
      initializationRef.current.completed.clear();
      initializationRef.current.inProgress = false;
      setState(prev => ({ ...prev, globalState: InitializationState.PENDING }));
    }
  }, [initializeContext, state.contexts]);

  // Initialize non-lazy contexts in order
  useEffect(() => {
    if (state.contexts.size === 0 || initializationRef.current.inProgress) {
      return;
    }

    const initializeNonLazyContexts = async () => {
      try {
        console.log('Starting context initialization...');
        initializationRef.current.inProgress = true;
        setState(prev => ({ ...prev, globalState: InitializationState.LOADING }));
        
        // Initialize contexts sequentially to ensure proper dependency order
        for (const type of state.initializationOrder) {
          const registration = state.contexts.get(type);
          if (registration && !registration.lazy) {
            console.log(`Initializing ${type}...`);
            await initializeContext(type, state.contexts);
            console.log(`${type} initialization complete`);
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
      } finally {
        initializationRef.current.inProgress = false;
      }
    };

    if (state.globalState === InitializationState.PENDING) {
      initializeNonLazyContexts();
    }
  }, [state.contexts, state.globalState, state.initializationOrder, initializeContext]);

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
