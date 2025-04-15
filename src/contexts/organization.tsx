
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";

interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  setOrganization: (org: Organization | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const { organization: authOrganization } = useAuth();
  
  // Initialize organization from auth context if available
  useEffect(() => {
    if (authOrganization) {
      console.log('Setting organization from auth context:', authOrganization);
      setOrganization({
        id: authOrganization.id,
        name: authOrganization.name,
        slug: authOrganization.slug,
        logo: authOrganization.logo
      });
    } else {
      // Fallback to hardcoded organization ID for demo purposes
      // This ensures devices will load even without auth
      console.log('No organization in auth context, using fallback');
      setOrganization({
        id: '7dcfb1a6-d855-4ed7-9a45-2e9f54590c18', // The organization ID from the device data
        name: 'Demo Organization',
        slug: 'demo-org'
      });
    }
  }, [authOrganization]);

  return (
    <OrganizationContext.Provider value={{ organization, setOrganization }}>
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
