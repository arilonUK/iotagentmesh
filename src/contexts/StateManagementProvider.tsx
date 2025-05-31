
import React from 'react';
import { useAppContext } from '@/hooks/useAppContext';

interface StateManagementProviderProps {
  children: React.ReactNode;
}

export const StateManagementProvider: React.FC<StateManagementProviderProps> = ({ children }) => {
  const { isInitialized, queryClient } = useAppContext();

  if (!isInitialized || !queryClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Export hooks for easy access - these now work with the centralized context factory
export { useEnhancedOrganization } from '@/contexts/organization/EnhancedOrganizationContext';
export { useStandardQuery, useStandardMutation } from '@/hooks/query/useStandardQuery';
