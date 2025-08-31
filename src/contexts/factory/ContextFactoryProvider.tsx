
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
import { createOptimizedContextInitializer } from './optimizedContextInitializer';

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
    contexts: new Map(), // Ensure contexts is always initialized as Map
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

  // Performance tracking
  const [initializationProgress, setInitializationProgress] = useState(0);
  const initStartTime = useRef<number>(0);

  // Use a ref to track initialization progress
  const initializationRef = useRef<{ inProgress: boolean; completed: Set<ContextType> }>({
    inProgress: false,
    completed: new Set()
  });

  // Create context hooks
  const { getContext, isReady, getError } = createContextHooks(state);

  // Create optimized context initializer
  const optimizedInitializer = createOptimizedContextInitializer(
    state.contexts,
    setState
  );

  // Create context initializer (legacy fallback)
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
      // Use optimized parallel retry only if optimizedInitializer exists
      if (optimizedInitializer && state.contexts && state.contexts.size > 0) {
        await optimizedInitializer.retryFailedContexts();
      }
    }
  }, [initializeContext, optimizedInitializer, state.contexts]);

  // Optimized parallel initialization
  useEffect(() => {
    if (!state.contexts || state.contexts.size === 0 || initializationRef.current.inProgress) {
      return;
    }

    const initializeContextsOptimized = async () => {
      try {
        console.log('Starting optimized context initialization...');
        initStartTime.current = performance.now();
        initializationRef.current.inProgress = true;
        setState(prev => ({ ...prev, globalState: InitializationState.LOADING }));
        
        // Use parallel initialization for better performance
        const results = await optimizedInitializer.initializeContextsParallel();
        
        // Update progress tracking
        const progressInterval = setInterval(() => {
          const progress = optimizedInitializer.getInitializationProgress();
          setInitializationProgress(progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
          }
        }, 100);
        
        const successCount = Array.from(results.values()).filter(r => r.success).length;
        const totalTime = performance.now() - initStartTime.current;
        
        console.log(`Optimized context initialization completed in ${totalTime.toFixed(2)}ms`);
        console.log(`Success rate: ${successCount}/${results.size} contexts`);
        
        setState(prev => ({ 
          ...prev, 
          globalState: successCount === results.size 
            ? InitializationState.READY 
            : InitializationState.ERROR
        }));
        
        clearInterval(progressInterval);
        setInitializationProgress(100);
        
      } catch (error) {
        console.error('Optimized context initialization failed:', error);
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
      initializeContextsOptimized();
    }
  }, [state.contexts, state.globalState, optimizedInitializer]);

  const value: ContextFactoryValue = {
    ...state,
    getContext,
    isReady,
    getError,
    setSession,
    retryInitialization,
    initializationProgress,
  };

  return (
    <ContextFactoryContext.Provider value={value}>
      {children}
    </ContextFactoryContext.Provider>
  );
};
