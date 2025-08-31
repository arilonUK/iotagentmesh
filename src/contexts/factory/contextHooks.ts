import { ContextType, ContextFactoryState, InitializationState } from './types';

export const createContextHooks = (state: ContextFactoryState) => {
  const getContext = <T = unknown>(type: ContextType): T | null => {
    const registration = state.contexts.get(type);
    if (!registration || registration.state !== InitializationState.READY) {
      return null;
    }
    return registration.instance as T;
  };

  const isReady = (type: ContextType): boolean => {
    const registration = state.contexts.get(type);
    return registration?.state === InitializationState.READY;
  };

  const getError = (type: ContextType): Error | null => {
    const registration = state.contexts.get(type);
    return registration?.error || null;
  };

  return { getContext, isReady, getError };
};