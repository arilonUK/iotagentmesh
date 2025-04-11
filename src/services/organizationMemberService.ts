
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrganizationUser, RoleType } from '@/types/organization';

/**
 * Fetch all members of an organization
 */
export async function fetchOrganizationMembers(organizationId: string): Promise<OrganizationUser[]> {
  try {
    // First attempt: Use the RPC function
    const { data, error } = await supabase.rpc(
      'get_organization_members',
      { p_org_id: organizationId }
    );
    
    if (error) {
      console.error('Error fetching organization members:', error);
      // Fall back to alternative method
      return fetchOrganizationMembersFallback(organizationId);
    }
    
    if (data && Array.isArray(data)) {
      return data.map(member => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        email: member.email,
        full_name: member.full_name,
        username: member.username
      }));
    }
    
    return [];
  } catch (err) {
    console.error('Error in fetchOrganizationMembers:', err);
    return fetchOrganizationMembersFallback(organizationId);
  }
}

/**
 * Fallback method when the RPC function fails
 */
async function fetchOrganizationMembersFallback(organizationId: string): Promise<OrganizationUser[]> {
  try {
    console.log('Using fallback method to fetch organization members');
    
    // Get members with roles
    const { data: rawMembers, error: membersError } = await supabase
      .from('organization_members')
      .select('id, user_id, role')
      .eq('organization_id', organizationId);
    
    if (membersError) {
      console.error('Fallback error fetching members:', membersError);
      toast.error('Error loading team members');
      return [];
    }
    
    if (!rawMembers || rawMembers.length === 0) {
      return [];
    }
    
    // For each member, fetch profile info
    const usersWithProfiles = await Promise.all(
      rawMembers.map(async (member) => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', member.user_id)
            .maybeSingle();
          
          return {
            ...member,
            email: profile?.username,
            full_name: profile?.full_name,
            username: profile?.username
          };
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          return member;
        }
      })
    );
    
    return usersWithProfiles;
  } catch (error) {
    console.error('Error in fallback method:', error);
    toast.error('Error loading team members');
    return [];
  }
}

/**
 * Remove a user from an organization
 */
export async function removeOrganizationMember(
  organizationId: string, 
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Error removing user');
      console.error('Error removing user:', error);
      return false;
    }

    toast.success('User removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    toast.error('Error removing user');
    return false;
  }
}

/**
 * Update a user's role in an organization
 */
export async function updateOrganizationMemberRole(
  organizationId: string, 
  userId: string, 
  newRole: string
): Promise<boolean> {
  try {
    // Cast newRole to the correct enum type
    const validRole = newRole as RoleType;
    
    const { error } = await supabase
      .from('organization_members')
      .update({ role: validRole })
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Error updating role');
      console.error('Error updating role:', error);
      return false;
    }

    toast.success('Role updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating role:', error);
    toast.error('Error updating role');
    return false;
  }
}
