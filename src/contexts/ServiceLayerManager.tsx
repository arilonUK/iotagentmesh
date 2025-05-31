
import React from 'react';
import { OrganizationProvider } from '@/contexts/organization';
import { NotificationProvider } from '@/contexts/notification/NotificationContext';
import { EnhancedOrganizationProvider } from '@/contexts/organization/EnhancedOrganizationContext';

interface ServiceLayerManagerProps {
  children: React.ReactNode;
}

export const ServiceLayerManager: React.FC<ServiceLayerManagerProps> = ({ children }) => {
  // No need to use any context here - just provide the service layer components
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
