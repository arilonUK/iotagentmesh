
import React from 'react';
import { ToastProvider } from '@/contexts/toast';
import { AuthProvider } from '@/contexts/auth';
import { OrganizationProvider } from '@/contexts/organization';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <AuthProvider>
            <OrganizationProvider>
              {children}
              <Toaster />
            </OrganizationProvider>
          </AuthProvider>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
