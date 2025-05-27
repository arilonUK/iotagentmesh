import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [isLoading, setIsLoading] = useState(true);
  const { session, user } = useAuth();

  // Load organization data when session changes
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!session?.user?.id) {
        console.log('No session, clearing organization data');
        setOrganization(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        console.log(`Loading organizations for user: ${session.user.id}`);
        
        // Get user organizations using the RPC function that works
        const { data: userOrganizations, error: orgsError } = await supabase
          .rpc('get_user_organizations', { p_user_id: session.user.id });

        if (orgsError) {
          console.error('Error fetching user organizations:', orgsError);
          setOrganization(null);
          setIsLoading(false);
          return;
        }

        if (!userOrganizations || userOrganizations.length === 0) {
          console.log('No organizations found for user');
          setOrganization(null);
          setIsLoading(false);
          return;
        }

        console.log(`Successfully fetched user organizations with RPC:`, userOrganizations);
        console.log(`Loaded user organizations: ${userOrganizations.length}`);

        // Find default organization or use first one
        const defaultOrg = userOrganizations.find(org => org.is_default) || userOrganizations[0];
        
        if (defaultOrg) {
          console.log(`Loading data for default organization: ${defaultOrg.name}`);
          
          // Use the new bypass service to get organization data
          const { fetchOrganizationData } = await import('@/services/organizationEntityService');
          const orgData = await fetchOrganizationData(defaultOrg.id, session.user.id);
          
          if (orgData) {
            const formattedOrg: Organization = {
              id: orgData.id,
              name: orgData.name,
              slug: orgData.slug,
              role: orgData.role as any,
              created_at: orgData.created_at,
              updated_at: orgData.updated_at
            };
            
            console.log('Successfully loaded organization data:', formattedOrg);
            setOrganization(formattedOrg);
          } else {
            console.error('Failed to load organization data');
            setOrganization(null);
          }
        }
      } catch (error) {
        console.error('Error loading organization data:', error);
        setOrganization(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizationData();
  }, [session?.user?.id]);

  const switchOrganization = async (organizationId: string) => {
    if (!session?.user?.id) return false;
    
    setIsLoading(true);
    
    try {
      const { data: success, error } = await supabase
        .rpc('switch_user_organization', {
          p_user_id: session.user.id,
          p_org_id: organizationId
        });

      if (error || !success) {
        console.error('Error switching organization:', error);
        return false;
      }

      // Reload organization data after switch
      const { fetchOrganizationData } = await import('@/services/organizationEntityService');
      const orgData = await fetchOrganizationData(organizationId, session.user.id);
      
      if (orgData) {
        const formattedOrg: Organization = {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          role: orgData.role as any,
          created_at: orgData.created_at,
          updated_at: orgData.updated_at
        };
        
        setOrganization(formattedOrg);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in switchOrganization:', error);
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
