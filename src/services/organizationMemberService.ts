
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrganizationUser, RoleType } from '@/types/organization';

/**
 * Fetch all members of an organization
 */
export async function fetchOrganizationMembers(organizationId: string): Promise<OrganizationUser[]> {
  try {
    // First attempt: Use the RPC function that bypasses RLS
    const { data, error } = await supabase.rpc(
      'get_organization_members_bypass_rls',
      { p_org_id: organizationId }
    );
    
    if (error) {
      console.error('Error fetching organization members:', error);
      // Fall back to alternative method
      return fetchOrganizationMembersFallback(organizationId);
    }
    
    // Need to join with profiles since RPC returns only organization_members
    if (data && Array.isArray(data)) {
      // Get all the user IDs to fetch their profiles
      const userIds = data.map(member => member.user_id);
      
      // Fetch profiles for all users in one go
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);
      
      // Map the profiles to their respective members
      return data.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        return {
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          email: profile?.username,
          full_name: profile?.full_name,
          username: profile?.username
        };
      });
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
    
    // Get members with roles, trying both methods
    let members = null;
    
    // Try the original get_organization_members RPC first
    try {
      const { data: rpcMembers, error: rpcError } = await supabase.rpc(
        'get_organization_members',
        { p_org_id: organizationId }
      );
      
      if (!rpcError && rpcMembers && rpcMembers.length > 0) {
        // If successful, map and return
        return rpcMembers.map(member => ({
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          email: member.email,
          full_name: member.full_name,
          username: member.username
        }));
      }
    } catch (rpcError) {
      console.error('Error using get_organization_members RPC:', rpcError);
    }
    
    // If RPC failed, try direct query as last resort
    const { data: rawMembers, error: membersError } = await supabase
      .from('organization_members')
      .select('id, user_id, role')
      .eq('organization_id', organizationId);
    
    if (membersError) {
      console.error('Fallback error fetching members:', membersError);
      toast('Error loading team members', { 
        style: { backgroundColor: 'red', color: 'white' } 
      });
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
    toast('Error loading team members', {
      style: { backgroundColor: 'red', color: 'white' }
    });
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
      console.error('Error removing user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing user:', error);
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
      console.error('Error updating role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating role:', error);
    return false;
  }
}
