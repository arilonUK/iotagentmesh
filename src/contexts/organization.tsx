
import React, { createContext, useState, useEffect, useContext } from 'react';
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
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userOrganizations, currentOrganization, switchOrganization: authSwitchOrganization } = useAuth();

  // Use organization data from auth context
  useEffect(() => {
    if (currentOrganization) {
      const formattedOrg: Organization = {
        id: currentOrganization.id,
        name: currentOrganization.name,
        slug: currentOrganization.slug,
        role: currentOrganization.role as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setOrganization(formattedOrg);
      console.log('Organization context updated from auth:', formattedOrg);
    } else {
      setOrganization(null);
    }
  }, [currentOrganization]);

  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = await authSwitchOrganization(organizationId);
      return success;
    } catch (error) {
      console.error('Error in organization context switchOrganization:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    organization,
    isLoading,
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
