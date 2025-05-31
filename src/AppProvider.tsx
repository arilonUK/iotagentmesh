
import React from 'react';
import { StateManagementProvider } from '@/contexts/StateManagementProvider';
import { ToastProvider } from '@/contexts/toast';
import { AuthProvider } from '@/contexts/auth';
import { OrganizationProvider } from '@/contexts/organization';
import { NotificationProvider } from '@/contexts/notification/NotificationContext';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <ToastProvider>
      <TooltipProvider>
        <AuthProvider>
          <StateManagementProvider>
            <OrganizationProvider>
              <NotificationProvider>
                {children}
                <Toaster />
              </NotificationProvider>
            </OrganizationProvider>
          </StateManagementProvider>
        </AuthProvider>
      </TooltipProvider>
    </ToastProvider>
  );
}
