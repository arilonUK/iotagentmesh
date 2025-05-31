
import { useCallback } from 'react';
import { ContextType, ContextFactoryState, InitializationState } from './types';

export const createContextHooks = (state: ContextFactoryState) => {
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

  return { getContext, isReady, getError };
};
