
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/contexts/auth/types';

// Define a role_type type to replace the Database reference
type RoleType = 'owner' | 'admin' | 'member' | 'viewer';

export type OrganizationDataReturn = {
  organization: Organization | null;
  userRole: string | null;
  fetchOrganizationData: (orgId: string, userId: string) => Promise<void>;
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
            logo: null, // Set default null since it's not in the RPC return
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
    }
  };
  
  // Separate function to fetch organization and role data using direct queries
  const fetchOrganizationSeparately = async (orgId: string, userId: string) => {
    // 1. First try to fetch the organization details
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug')
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
        });
        console.log('Organization data fetched successfully:', orgData.name);
      }
    } catch (orgFetchError) {
      console.error('Exception fetching organization:', orgFetchError);
    }
    
    // 2. In a separate try/catch block, fetch the user's role directly
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
                role: 'member' as RoleType // Use our own type definition
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
  };
};
