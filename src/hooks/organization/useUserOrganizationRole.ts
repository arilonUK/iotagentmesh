
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserOrganizationRoleReturn = {
  userRole: string | null;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
  fetchUserRole: (orgId: string, userId: string) => Promise<void>;
};

export const useUserOrganizationRole = (): UserOrganizationRoleReturn => {
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async (orgId: string, userId: string) => {
    if (!orgId || !userId) {
      console.log('Missing organization ID or user ID for role fetching');
      return;
    }

    console.log(`Fetching user role for org: ${orgId}, user: ${userId}`);
    
    // Try the bypass RLS function first
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
        return;
      }
    } catch (roleError) {
      console.error('Exception fetching user role with bypass function:', roleError);
    }
    
    // If we couldn't get the role with the bypass function, try the fallback
    await fetchUserRoleFallback(orgId, userId);
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
      }
    } catch (roleFetchError) {
      console.error('Exception fetching user role:', roleFetchError);
    }
  };

  return {
    userRole,
    setUserRole,
    fetchUserRole
  };
};
