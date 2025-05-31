
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from '@/contexts/notification/NotificationContext';
import { EnhancedOrganizationProvider } from '@/contexts/organization/EnhancedOrganizationContext';

// Create a global query client with standardized configuration
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
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

let queryClient: QueryClient;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!queryClient) queryClient = createQueryClient();
    return queryClient;
  }
}

interface StateManagementProviderProps {
  children: React.ReactNode;
}

export const StateManagementProvider: React.FC<StateManagementProviderProps> = ({ children }) => {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      <NotificationProvider>
        <EnhancedOrganizationProvider>
          {children}
        </EnhancedOrganizationProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
};

// Export hooks for easy access
export { useNotificationContext } from '@/contexts/notification/NotificationContext';
export { useEnhancedOrganization } from '@/contexts/organization/EnhancedOrganizationContext';
export { useStandardQuery, useStandardMutation } from '@/hooks/query/useStandardQuery';
