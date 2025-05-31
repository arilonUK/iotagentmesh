
import React from 'react';
import { OrganizationProvider } from '@/contexts/organization';
import { NotificationProvider } from '@/contexts/notification/NotificationContext';
import { EnhancedOrganizationProvider } from '@/contexts/organization/EnhancedOrganizationContext';

interface ServiceLayerManagerProps {
  children: React.ReactNode;
}

export const ServiceLayerManager: React.FC<ServiceLayerManagerProps> = ({ children }) => {
  // Simplified service layer - services are now direct imports where needed
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
