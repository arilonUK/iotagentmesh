import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Organization } from '@/contexts/auth/types';
import { supabase } from '@/integrations/supabase/client';

export type OrganizationDataReturn = {
  organization: Organization | null;
  userRole: string | null;
  fetchOrganizationData: (orgId: string, userId: string) => Promise<void>;
  setOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
};

export const useOrganizationData = (): OrganizationDataReturn => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchOrganizationData = async (orgId: string, userId: string) => {
    try {
      if (!orgId || !userId) {
        console.log('Missing organization ID or user ID');
        return;
      }

      console.log(`Fetching organization data for org: ${orgId}, user: ${userId}`);
      
      // Get the user's role directly using the bypass RLS function
      try {
        const { data: userRoleData, error: userRoleError } = await supabase.rpc(
          'get_user_organization_role_bypass_rls',
          { p_org_id: orgId, p_user_id: userId }
        );
        
        if (userRoleError) {
          console.error('Error fetching user role with bypass function:', userRoleError);
        } else if (userRoleData !== null) {
          setUserRole(userRoleData);
          console.log('User role fetched successfully using bypass function:', userRoleData);
        }
      } catch (roleError) {
        console.error('Exception fetching user role with bypass function:', roleError);
      }
      
      // Fetch organization details
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
            logo: null, // Set default null since it's not in the database query
            created_at: orgData.created_at,
            updated_at: orgData.updated_at
          });
          console.log('Organization data fetched successfully:', orgData.name);
        }
      } catch (orgFetchError) {
        console.error('Exception fetching organization:', orgFetchError);
      }
      
      // If we couldn't get the user's role using the bypass function, try other methods
      if (!userRole) {
        await fetchUserRoleFallback(orgId, userId);
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };
  
  // Fallback method to fetch user role
  const fetchUserRoleFallback = async (orgId: string, userId: string) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching user role:', memberError);
      } else if (memberData) {
        console.log('User role data:', memberData.role);
        setUserRole(memberData.role);
      } else {
        console.log('No role found for user in this organization');
        
        // If no role was found but we have an organization, try to create a member record
        if (organization) {
          console.log('Creating member role for user');
          try {
            const { error: createRoleError } = await supabase
              .from('organization_members')
              .insert({
                organization_id: orgId,
                user_id: userId,
                role: 'member' as any  // Default role
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

  return {
    organization,
    userRole,
    fetchOrganizationData,
    setOrganization
  };
};
