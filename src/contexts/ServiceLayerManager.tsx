
import React, { useEffect } from 'react';
import { OrganizationProvider } from '@/contexts/organization';
import { NotificationProvider } from '@/contexts/notification/NotificationContext';
import { EnhancedOrganizationProvider } from '@/contexts/organization/EnhancedOrganizationContext';
import { useAppContext, InitializationPhase } from '@/contexts/AppContextFactory';

interface ServiceLayerManagerProps {
  children: React.ReactNode;
}

export const ServiceLayerManager: React.FC<ServiceLayerManagerProps> = ({ children }) => {
  const { phase, setPhase } = useAppContext();

  useEffect(() => {
    // Mark services as ready once auth is ready
    if (phase === InitializationPhase.AUTH_READY) {
      // Small delay to ensure all auth-dependent services are initialized
      const timer = setTimeout(() => {
        setPhase(InitializationPhase.COMPLETE);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [phase, setPhase]);

  return (
    <EnhancedOrganizationProvider>
      <OrganizationProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </OrganizationProvider>
    </EnhancedOrganizationProvider>
  );
};
