
import { useState } from 'react';
import { toast } from 'sonner';
import { Organization, UserOrganization } from './types';
import { profileServices } from './profileServices';
import { supabase } from '@/integrations/supabase/client';

export type OrganizationManagerReturn = {
  organization: Organization | null;
  userRole: string | null;
  userOrganizations: UserOrganization[];
  switchOrganization: (organizationId: string) => Promise<boolean>;
  fetchOrganizationData: (orgId: string, userId: string) => Promise<void>;
  setUserOrganizations: (orgs: UserOrganization[]) => void;
};

export const useOrganizationManager = (userId: string | undefined): OrganizationManagerReturn => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);

  const fetchOrganizationData = async (orgId: string, userId: string) => {
    try {
      // Use a single query to fetch both organization and member role
      // This avoids the recursive policy issue
      const { data, error } = await supabase.rpc(
        'get_organization_with_role',
        { 
          p_org_id: orgId,
          p_user_id: userId
        }
      );

      if (error) {
        console.error('Error fetching organization with role:', error);
      } else if (data && data.length > 0) {
        const orgData = data[0];
        
        // Set organization data
        setOrganization({
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          created_at: orgData.created_at,
          updated_at: orgData.updated_at
        });
        
        // Set user's role in this organization
        setUserRole(orgData.role);
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    if (!userId) {
      toast('You must be logged in to switch organizations', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      return false;
    }

    const success = await profileServices.switchOrganization(userId, organizationId);
    
    if (success) {
      // Refresh organization data
      fetchOrganizationData(organizationId, userId);
      
      // Update the current organization in the userOrganizations list
      setUserOrganizations(prevOrgs => 
        prevOrgs.map(org => ({
          ...org,
          is_default: org.id === organizationId
        }))
      );
    }
    
    return success;
  };

  return {
    organization,
    userRole,
    userOrganizations,
    switchOrganization,
    fetchOrganizationData,
    setUserOrganizations,
  };
};
