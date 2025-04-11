
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
  const [isProcessingSwitch, setIsProcessingSwitch] = useState<boolean>(false);

  const fetchOrganizationData = async (orgId: string, userId: string) => {
    try {
      if (!orgId || !userId) {
        console.log('Missing organization ID or user ID');
        return;
      }

      console.log(`Fetching organization data for org: ${orgId}, user: ${userId}`);
      
      // 1. Fetch the organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug, created_at, updated_at')
        .eq('id', orgId)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        throw orgError;
      }

      // Set organization data immediately so UI can update
      setOrganization({
        id: orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        created_at: orgData.created_at,
        updated_at: orgData.updated_at
      });
      
      // 2. In a separate query, fetch the user's role in this organization
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching user role:', memberError);
        // Don't throw here, we can still continue with null role
      }

      // Set user's role (or null if not found)
      console.log('User role data:', memberData);
      setUserRole(memberData?.role || null);
      
    } catch (error) {
      console.error('Error fetching organization data:', error);
      
      // Only attempt to switch organizations if there was a critical error with the current one
      // and we're not already processing a switch
      if (!isProcessingSwitch && !organization && userId && userOrganizations.length > 0) {
        try {
          // Find an organization different from the one we just tried
          const nextOrg = userOrganizations.find(org => org.id !== orgId) || userOrganizations[0];
          console.log('Switching to organization:', nextOrg.id);
          // Don't await here to prevent blocking
          switchOrganization(nextOrg.id);
        } catch (switchError) {
          console.error('Error switching organization after failed fetch:', switchError);
        }
      }
      
      // Don't reset state if we already have data
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

    // Prevent multiple simultaneous switches
    if (isProcessingSwitch) {
      console.log('Organization switch already in progress');
      return false;
    }

    try {
      setIsProcessingSwitch(true);
      console.log(`Switching organization to: ${organizationId} for user: ${userId}`);
      
      const success = await profileServices.switchOrganization(userId, organizationId);
      
      if (success) {
        // Update the current organization in the userOrganizations list
        setUserOrganizations(prevOrgs => 
          prevOrgs.map(org => ({
            ...org,
            is_default: org.id === organizationId
          }))
        );

        // Fetch organization data but don't wait for it
        fetchOrganizationData(organizationId, userId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error switching organization:', error);
      return false;
    } finally {
      // Always reset processing state when done
      setIsProcessingSwitch(false);
    }
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
