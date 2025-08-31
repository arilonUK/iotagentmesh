
import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session, User } from '@supabase/supabase-js';

// Define the initialization phases
export enum InitializationPhase {
  INITIALIZING = 'initializing',
  CORE_READY = 'core_ready',
  AUTH_READY = 'auth_ready',
  SERVICES_READY = 'services_ready',
  COMPLETE = 'complete'
}

interface AppContextState {
  phase: InitializationPhase;
  queryClient: QueryClient | null;
  session: Session | null;
  user: User | null;
  isReady: boolean;
  error: Error | null;
}

interface AppContextValue extends AppContextState {
  setPhase: (phase: InitializationPhase) => void;
  setSession: (session: Session | null) => void;
  setError: (error: Error | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextFactory');
  }
  return context;
};

// Create a stable query client instance
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: unknown) => {
        const err = error as { status?: number };
        if (err?.status && err.status >= 400 && err.status < 500) {
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

let globalQueryClient: QueryClient;

function getQueryClient() {
  if (!globalQueryClient) {
    globalQueryClient = createQueryClient();
  }
  return globalQueryClient;
}

export const AppContextFactory: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppContextState>({
    phase: InitializationPhase.INITIALIZING,
    queryClient: null,
    session: null,
    user: null,
    isReady: false,
    error: null,
  });

  const setPhase = (phase: InitializationPhase) => {
    setState(prev => ({
      ...prev,
      phase,
      isReady: phase === InitializationPhase.COMPLETE
    }));
  };

  const setSession = (session: Session | null) => {
    setState(prev => ({
      ...prev,
      session,
      user: session?.user ?? null
    }));
  };

  const setError = (error: Error | null) => {
    setState(prev => ({ ...prev, error }));
  };

  // Initialize core services
  useEffect(() => {
    try {
      const queryClient = getQueryClient();
      setState(prev => ({
        ...prev,
        queryClient,
        phase: InitializationPhase.CORE_READY
      }));
    } catch (error) {
      setError(error as Error);
    }
  }, []);

  const value: AppContextValue = {
    ...state,
    setPhase,
    setSession,
    setError,
  };

  // Only render children when core is ready
  if (state.phase === InitializationPhase.INITIALIZING || !state.queryClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Application Error</h2>
          <p className="text-muted-foreground">{state.error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      <QueryClientProvider client={state.queryClient}>
        {children}
      </QueryClientProvider>
    </AppContext.Provider>
  );
};
