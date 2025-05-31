
import { useContextFactory, ContextType, InitializationState } from '@/contexts/ContextFactory';

export const useAppContext = () => {
  const contextFactory = useContextFactory();

  const isInitialized = contextFactory.globalState === InitializationState.READY;
  const isLoading = contextFactory.globalState === InitializationState.LOADING;
  const hasError = contextFactory.globalState === InitializationState.ERROR;

  const queryClient = contextFactory.getContext(ContextType.QUERY_CLIENT);
  const { session, user } = contextFactory;

  return {
    // State
    isInitialized,
    isLoading,
    hasError,
    session,
    user,
    queryClient,
    
    // Context access
    getContext: contextFactory.getContext,
    isContextReady: contextFactory.isReady,
    getContextError: contextFactory.getError,
    
    // Actions
    retryInitialization: contextFactory.retryInitialization,
  };
};
