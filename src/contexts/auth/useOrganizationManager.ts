
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

      // Instead of using a complex query with inner joins that causes recursion,
      // fetch organization data and role separately
      
      // 1. First, fetch the organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug, created_at, updated_at')
        .eq('id', orgId)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        throw orgError;
      }

      // 2. Next, fetch the user's role in this organization
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single();

      if (memberError) {
        console.error('Error fetching user role:', memberError);
        // Don't throw here, we still want to set organization data
      }

      // Set organization data
      setOrganization({
        id: orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        created_at: orgData.created_at,
        updated_at: orgData.updated_at
      });
      
      // Set user's role
      setUserRole(memberData?.role || null);
      
    } catch (error) {
      console.error('Error fetching organization data:', error);
      
      // Handle error cases - check if user has other organizations available
      if (userId && (!organization || !userOrganizations.length)) {
        try {
          const userOrgs = await profileServices.getUserOrganizations(userId);
          
          if (userOrgs.length > 0) {
            console.log('Available user organizations:', userOrgs);
            setUserOrganizations(userOrgs);
            
            // If the current organization fetch failed, try another one
            if (orgId === organization?.id && userOrgs.length > 0) {
              const nextOrg = userOrgs.find(org => org.id !== orgId) || userOrgs[0];
              console.log('Switching to organization:', nextOrg.id);
              await switchOrganization(nextOrg.id);
            }
          }
        } catch (fetchError) {
          console.error('Error fetching user organizations:', fetchError);
        }
      }
      
      // Reset state on critical errors
      if (!organization) {
        setUserRole(null);
      }
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
