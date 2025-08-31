
import { useState, useEffect, useCallback } from 'react';
import { ContextType, InitializationState, ContextRegistration, ContextFactoryState } from './types';

interface ContextInitializationResult {
  success: boolean;
  error?: Error;
  duration: number;
}

interface OptimizedInitializer {
  initializeContextsParallel: () => Promise<Map<ContextType, ContextInitializationResult>>;
  getInitializationProgress: () => number;
  retryFailedContexts: () => Promise<void>;
}

export const createOptimizedContextInitializer = (
  contextRegistrations: Map<ContextType, ContextRegistration>,
  onStateChange: (state: ContextFactoryState) => void
): OptimizedInitializer => {
  
  const initializeContextsParallel = async (): Promise<Map<ContextType, ContextInitializationResult>> => {
    const results = new Map<ContextType, ContextInitializationResult>();
    
    // Group contexts by dependency level for parallel initialization
    const contextLevels = groupContextsByDependencyLevel(contextRegistrations);
    
    console.log('Starting parallel context initialization...', {
      totalContexts: contextRegistrations.size,
      levels: contextLevels.length
    });

    // Initialize contexts level by level (parallel within each level)
    for (let level = 0; level < contextLevels.length; level++) {
      const contextsInLevel = contextLevels[level];
      console.log(`Initializing level ${level} with ${contextsInLevel.length} contexts`);
      
      const levelPromises = contextsInLevel.map(async (contextType) => {
        const startTime = performance.now();
        
        try {
          const registration = contextRegistrations.get(contextType);
          if (!registration) {
            throw new Error(`No registration found for ${contextType}`);
          }

          const instance = await registration.factory();
          
          // Update registration state
          registration.state = InitializationState.READY;
          registration.instance = instance;
          registration.error = null;

          const duration = performance.now() - startTime;
          const result: ContextInitializationResult = { success: true, duration };
          results.set(contextType, result);
          
          console.log(`✅ ${contextType} initialized in ${duration.toFixed(2)}ms`);
          
          return { contextType, success: true };
        } catch (error) {
          const duration = performance.now() - startTime;
          const registration = contextRegistrations.get(contextType);
          
          if (registration) {
            registration.state = InitializationState.ERROR;
            registration.error = error as Error;
          }

          const result: ContextInitializationResult = { 
            success: false, 
            error: error as Error, 
            duration 
          };
          results.set(contextType, result);
          
          console.error(`❌ ${contextType} failed in ${duration.toFixed(2)}ms:`, error);
          
          return { contextType, success: false, error };
        }
      });

      // Wait for all contexts in this level to complete
      await Promise.allSettled(levelPromises);
      
      // Update global state after each level
      onStateChange({
        ...({} as ContextFactoryState),
        globalState: level === contextLevels.length - 1 
          ? InitializationState.READY 
          : InitializationState.LOADING
      });
    }

    const successCount = Array.from(results.values()).filter(r => r.success).length;
    const totalTime = Array.from(results.values()).reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`Context initialization complete: ${successCount}/${results.size} successful, total time: ${totalTime.toFixed(2)}ms`);
    
    return results;
  };

  const getInitializationProgress = (): number => {
    const total = contextRegistrations.size;
    const ready = Array.from(contextRegistrations.values())
      .filter(reg => reg.state === InitializationState.READY).length;
    
    return total > 0 ? (ready / total) * 100 : 0;
  };

  const retryFailedContexts = async (): Promise<void> => {
    const failedContexts = Array.from(contextRegistrations.entries())
      .filter(([_, reg]) => reg.state === InitializationState.ERROR)
      .map(([type, _]) => type);

    if (failedContexts.length === 0) {
      console.log('No failed contexts to retry');
      return;
    }

    console.log(`Retrying ${failedContexts.length} failed contexts...`);
    
    for (const contextType of failedContexts) {
      try {
        const registration = contextRegistrations.get(contextType);
        if (!registration) continue;

        registration.state = InitializationState.LOADING;
        const instance = await registration.factory();
        
        registration.state = InitializationState.READY;
        registration.instance = instance;
        registration.error = null;
        
        console.log(`✅ Retry successful for ${contextType}`);
      } catch (error) {
        console.error(`❌ Retry failed for ${contextType}:`, error);
      }
    }
  };

  return {
    initializeContextsParallel,
    getInitializationProgress,
    retryFailedContexts
  };
};

// Helper function to group contexts by dependency level
function groupContextsByDependencyLevel(
  registrations: Map<ContextType, ContextRegistration>
): ContextType[][] {
  const levels: ContextType[][] = [];
  const processed = new Set<ContextType>();
  const inProgress = new Set<ContextType>();

  const addToLevel = (contextType: ContextType, level: number): void => {
    if (processed.has(contextType) || inProgress.has(contextType)) return;
    
    const registration = registrations.get(contextType);
    if (!registration) return;

    // Check if all dependencies are already processed
    const canProcess = registration.dependencies.every(dep => processed.has(dep));
    
    if (canProcess) {
      if (!levels[level]) levels[level] = [];
      levels[level].push(contextType);
      inProgress.add(contextType);
    }
  };

  // Build dependency levels
  let currentLevel = 0;
  while (processed.size < registrations.size && currentLevel < 10) { // Safety limit
    // Find contexts that can be processed at this level
    for (const [contextType, registration] of registrations) {
      if (processed.has(contextType)) continue;
      
      const canProcess = registration.dependencies.every(dep => processed.has(dep));
      if (canProcess) {
        addToLevel(contextType, currentLevel);
      }
    }

    // Mark all contexts in current level as processed
    if (levels[currentLevel]) {
      levels[currentLevel].forEach(ctx => {
        processed.add(ctx);
        inProgress.delete(ctx);
      });
    }

    currentLevel++;
  }

  return levels.filter(level => level.length > 0);
}
