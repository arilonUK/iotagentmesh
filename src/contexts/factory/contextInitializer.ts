
import { ContextType, ContextRegistration, InitializationState, ContextFactoryState } from './types';

export const createContextInitializer = (
  setState: React.Dispatch<React.SetStateAction<ContextFactoryState>>,
  initializationRef: React.MutableRefObject<{ inProgress: boolean; completed: Set<ContextType> }>
) => {
  const initializeContext = async (
    type: ContextType, 
    currentContexts: Map<ContextType, ContextRegistration>
  ): Promise<void> => {
    console.log(`Starting initialization for context: ${type}`);
    
    const registration = currentContexts.get(type);
    if (!registration) {
      throw new Error(`Context ${type} not found`);
    }

    if (registration.state === InitializationState.READY) {
      console.log(`Context ${type} already ready`);
      initializationRef.current.completed.add(type);
      return;
    }

    // Check dependencies
    for (const dep of registration.dependencies) {
      if (!initializationRef.current.completed.has(dep)) {
        throw new Error(`Dependency ${dep} not ready for ${type}`);
      }
    }

    try {
      // Update state to loading
      setState((prev: ContextFactoryState) => {
        const newContexts = new Map(prev.contexts);
        const existingReg = newContexts.get(type) as ContextRegistration;
        if (!existingReg) {
          throw new Error(`Context ${type} not found in state`);
        }
        const reg: ContextRegistration = {
          type: existingReg.type,
          factory: existingReg.factory,
          dependencies: existingReg.dependencies,
          lazy: existingReg.lazy,
          state: InitializationState.LOADING,
          instance: existingReg.instance,
          error: undefined
        };
        newContexts.set(type, reg);
        return { ...prev, contexts: newContexts };
      });

      const instance = await registration.factory();
      console.log(`Context ${type} initialized successfully:`, instance);

      // Update state to ready
      setState((prev: ContextFactoryState) => {
        const newContexts = new Map(prev.contexts);
        const existingReg = newContexts.get(type) as ContextRegistration;
        if (!existingReg) {
          throw new Error(`Context ${type} not found in state`);
        }
        const reg: ContextRegistration = {
          type: existingReg.type,
          factory: existingReg.factory,
          dependencies: existingReg.dependencies,
          lazy: existingReg.lazy,
          state: InitializationState.READY,
          instance: instance,
          error: undefined
        };
        newContexts.set(type, reg);
        return { ...prev, contexts: newContexts };
      });

      // Mark as completed
      initializationRef.current.completed.add(type);
    } catch (error) {
      console.error(`Failed to initialize context ${type}:`, error);
      
      // Update state to error
      setState((prev: ContextFactoryState) => {
        const newContexts = new Map(prev.contexts);
        const existingReg = newContexts.get(type) as ContextRegistration;
        if (!existingReg) {
          throw new Error(`Context ${type} not found in state`);
        }
        const reg: ContextRegistration = {
          type: existingReg.type,
          factory: existingReg.factory,
          dependencies: existingReg.dependencies,
          lazy: existingReg.lazy,
          state: InitializationState.ERROR,
          instance: existingReg.instance,
          error: error as Error
        };
        newContexts.set(type, reg);
        return { ...prev, contexts: newContexts, error: error as Error };
      });
      throw error;
    }
  };

  return { initializeContext };
};
