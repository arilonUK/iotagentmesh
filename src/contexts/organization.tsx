
import React, { createContext, useContext } from 'react';
import { useAuth } from './auth';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  switchOrganization: (organizationId: string) => Promise<boolean>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentOrganization, switchOrganization: authSwitchOrganization, loading } = useAuth();

  // Transform the auth organization data to match the expected interface
  const organization: Organization | null = currentOrganization ? {
    id: currentOrganization.id,
    name: currentOrganization.name,
    slug: currentOrganization.slug,
    role: currentOrganization.role as 'owner' | 'admin' | 'member',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : null;

  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    if (!authSwitchOrganization) {
      console.error('Auth switchOrganization function not available');
      return false;
    }
    
    try {
      const success = await authSwitchOrganization(organizationId);
      return success;
    } catch (error) {
      console.error('Error in organization context switchOrganization:', error);
      return false;
    }
  };

  const value = {
    organization,
    isLoading: loading,
    switchOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};
