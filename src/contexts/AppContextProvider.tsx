
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ContextFactoryProvider, useContextFactory, ContextType } from './ContextFactory';
import { ContextErrorBoundary } from './ContextErrorBoundary';
import { CoreProvider } from './CoreProvider';
import { AuthContextManager } from './auth/AuthContextManager';
import { ServiceLayerManager } from './ServiceLayerManager';

// Loading component for context initialization
const ContextInitializationLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Initializing application contexts...</p>
      </div>
    </div>
  );
};

// Inner provider that uses the context factory
const AppContextProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getContext, isReady, getError, globalState } = useContextFactory();

  // Get the query client from context factory
  const queryClient = getContext(ContextType.QUERY_CLIENT);

  // Show loading while contexts are initializing
  if (globalState === 'loading' || globalState === 'pending') {
    return <ContextInitializationLoader />;
  }

  // Show error if context initialization failed
  if (globalState === 'error') {
    const error = getError(ContextType.QUERY_CLIENT) || new Error('Context initialization failed');
    throw error;
  }

  // Ensure query client is ready
  if (!queryClient || !isReady(ContextType.QUERY_CLIENT)) {
    return <ContextInitializationLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ContextErrorBoundary contextName="Core Providers">
        <CoreProvider>
          <ContextErrorBoundary contextName="Authentication">
            <AuthContextManager>
              <ContextErrorBoundary contextName="Services">
                <ServiceLayerManager>
                  {children}
                </ServiceLayerManager>
              </ContextErrorBoundary>
            </AuthContextManager>
          </ContextErrorBoundary>
        </CoreProvider>
      </ContextErrorBoundary>
    </QueryClientProvider>
  );
};

// Main AppContextProvider with centralized management
export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ContextErrorBoundary contextName="Application">
      <ContextFactoryProvider>
        <AppContextProviderInner>
          {children}
        </AppContextProviderInner>
      </ContextFactoryProvider>
    </ContextErrorBoundary>
  );
};

// Hook for accessing the centralized context factory
export { useContextFactory } from './ContextFactory';
export { ContextType, InitializationState } from './ContextFactory';
