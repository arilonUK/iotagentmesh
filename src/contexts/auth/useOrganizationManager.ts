
import { useState } from 'react';
import { toast } from 'sonner';
import { Organization, UserOrganization } from './types';
import { profileServices } from './profileServices';

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
      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
      } else {
        setOrganization(orgData as Organization);
      }

      // Fetch user's role in this organization
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single();

      if (memberError) {
        console.error('Error fetching member role:', memberError);
      } else if (memberData) {
        setUserRole(memberData.role);
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

import { supabase } from '@/integrations/supabase/client';
