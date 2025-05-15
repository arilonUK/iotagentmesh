
import React from 'react';
import { ToastProvider } from '@/contexts/toast';
import { AuthProvider } from '@/contexts/auth';
import { OrganizationProvider } from '@/contexts/organization';
import { Toaster } from '@/components/ui/toaster';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <OrganizationProvider>
          {children}
          <Toaster />
        </OrganizationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
