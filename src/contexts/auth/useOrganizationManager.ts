
import { useState, useEffect } from 'react';
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
      
      // Use RPC function to avoid RLS policy recursion issues
      try {
        const { data, error } = await supabase.rpc('get_organization_with_role', {
          p_org_id: orgId,
          p_user_id: userId
        });
        
        if (error) {
          console.error('Error fetching organization with role:', error);
        } else if (data && data.length > 0) {
          const orgData = data[0];
          setOrganization({
            id: orgData.id,
            name: orgData.name,
            slug: orgData.slug,
            created_at: orgData.created_at,
            updated_at: orgData.updated_at
          });
          
          setUserRole(orgData.role);
          console.log('Organization and role data fetched successfully:', orgData.name, orgData.role);
        } else {
          console.log('No organization data found');
          
          // Fallback to separate queries if RPC fails to return data
          await fetchOrganizationSeparately(orgId, userId);
        }
      } catch (rpcError) {
        console.error('Error with RPC call:', rpcError);
        
        // Fallback to separate queries
        await fetchOrganizationSeparately(orgId, userId);
      }
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
    }
  };
  
  // Separate function to fetch organization and role data using direct queries
  // This avoids RLS recursion by fetching in separate queries
  const fetchOrganizationSeparately = async (orgId: string, userId: string) => {
    // 1. First try to fetch the organization details using service role (bypasses RLS)
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug, created_at, updated_at')
        .eq('id', orgId)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
      } else if (orgData) {
        // Set organization data immediately so UI can update
        setOrganization({
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          created_at: orgData.created_at,
          updated_at: orgData.updated_at
        });
        console.log('Organization data fetched successfully:', orgData.name);
      }
    } catch (orgFetchError) {
      console.error('Exception fetching organization:', orgFetchError);
    }
    
    // 2. In a separate try/catch block, fetch the user's role directly
    try {
      const { data: memberData, error: memberError } = await supabase
        .rpc('get_user_role', {
          org_id: orgId,
          user_id: userId
        });

      if (memberError) {
        console.error('Error fetching user role:', memberError);
      } else {
        console.log('User role data:', memberData);
        setUserRole(memberData);
        
        // If no role was found but we have an organization, try to create a member record
        if (!memberData && organization) {
          console.log('No role found, creating member role for user');
          try {
            const { error: createRoleError } = await supabase
              .from('organization_members')
              .insert({
                organization_id: orgId,
                user_id: userId,
                role: 'member'  // Default role
              });
              
            if (createRoleError) {
              console.error('Error creating member role:', createRoleError);
            } else {
              console.log('Created member role for user');
              setUserRole('member');
            }
          } catch (createRoleError) {
            console.error('Exception creating member role:', createRoleError);
          }
        }
      }
    } catch (roleFetchError) {
      console.error('Exception fetching user role:', roleFetchError);
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
