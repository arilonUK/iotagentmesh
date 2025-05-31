
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
      <StateManagementProvider>
        <TooltipProvider>
          <AuthProvider>
            <OrganizationProvider>
              <NotificationProvider>
                {children}
                <Toaster />
              </NotificationProvider>
            </OrganizationProvider>
          </AuthProvider>
        </TooltipProvider>
      </StateManagementProvider>
    </ToastProvider>
  );
}
