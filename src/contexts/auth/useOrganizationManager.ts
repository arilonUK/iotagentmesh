
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
      if (!orgId || !userId) {
        console.log('Missing organization ID or user ID');
        return;
      }

      console.log(`Fetching organization data for org: ${orgId}, user: ${userId}`);

      // Use a direct query instead of RPC to avoid TypeScript issues
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          slug,
          created_at,
          updated_at,
          organization_members!inner(role)
        `)
        .eq('id', orgId)
        .eq('organization_members.user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching organization with role:', error);
        
        // If no organization found, check if user has any organizations
        const userOrgs = await profileServices.getUserOrganizations(userId);
        console.log('Available user organizations:', userOrgs);
        
        if (userOrgs.length > 0) {
          // If user has other organizations, switch to the first one
          console.log('Switching to organization:', userOrgs[0].id);
          await switchOrganization(userOrgs[0].id);
          return;
        } else {
          // If no organizations are found, reset the state
          setOrganization(null);
          setUserRole(null);
          console.log('No organizations found for user');
        }
      } else if (data) {
        console.log('Organization data fetched:', data);
        
        // Set organization data
        setOrganization({
          id: data.id,
          name: data.name,
          slug: data.slug,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
        
        // Set user's role in this organization
        if (data.organization_members && Array.isArray(data.organization_members) && data.organization_members.length > 0) {
          setUserRole(data.organization_members[0].role);
          console.log('User role set to:', data.organization_members[0].role);
        } else {
          console.log('No role information found in organization data');
          setUserRole(null);
        }
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
      // Reset state on critical errors
      setUserRole(null);
    }
  };

  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    if (!userId) {
      toast('You must be logged in to switch organizations', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      return false;
    }

    console.log(`Switching organization to: ${organizationId} for user: ${userId}`);
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
