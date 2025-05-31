
import { useAppContext, InitializationPhase } from '@/contexts/AppContextFactory';

export const useAppInitialization = () => {
  const { phase, isReady, error, queryClient, session, user } = useAppContext();

  const isInitializing = phase === InitializationPhase.INITIALIZING;
  const isCoreReady = phase >= InitializationPhase.CORE_READY;
  const isAuthReady = phase >= InitializationPhase.AUTH_READY;
  const isServicesReady = phase >= InitializationPhase.SERVICES_READY;
  const isComplete = phase === InitializationPhase.COMPLETE;

  return {
    phase,
    isReady,
    error,
    queryClient,
    session,
    user,
    isInitializing,
    isCoreReady,
    isAuthReady,
    isServicesReady,
    isComplete,
  };
};
