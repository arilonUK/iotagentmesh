
import { supabase } from '@/integrations/supabase/client';

export type OrganizationMembershipReturn = {
  createMemberRole: (orgId: string, userId: string, role?: string) => Promise<boolean>;
};

export const useOrganizationMembership = (): OrganizationMembershipReturn => {
  const createMemberRole = async (orgId: string, userId: string, role: string = 'member'): Promise<boolean> => {
    if (!orgId || !userId) {
      console.log('Missing organization ID or user ID');
      return false;
    }
    
    console.log('Creating member role for user');
    try {
      const { error: createRoleError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: userId,
          role: role as 'owner' | 'admin' | 'member' // Default role
        });
        
      if (createRoleError) {
        console.error('Error creating member role:', createRoleError);
        return false;
      } else {
        console.log('Created member role for user');
        return true;
      }
    } catch (createRoleError) {
      console.error('Exception creating member role:', createRoleError);
      return false;
    }
  };

  return {
    createMemberRole
  };
};
