
import React from 'react';
import { AppContextFactory } from '@/contexts/AppContextFactory';
import { CoreProvider } from '@/contexts/CoreProvider';
import { AuthContextManager } from '@/contexts/auth/AuthContextManager';
import { ServiceLayerManager } from '@/contexts/ServiceLayerManager';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <AppContextFactory>
      <CoreProvider>
        <AuthContextManager>
          <ServiceLayerManager>
            {children}
          </ServiceLayerManager>
        </AuthContextManager>
      </CoreProvider>
    </AppContextFactory>
  );
}
