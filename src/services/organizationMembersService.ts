
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { OrgMemberResponse, OrganizationUser, RoleType } from '@/types/organization';

// Fetch organization users from the database
export async function fetchOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
  try {
    const { data, error } = await supabase.rpc('get_organization_members', 
      { p_org_id: organizationId }
    );
    
    if (error) {
      console.error('Error fetching organization members:', error);
      return fetchOrganizationUsersFallback(organizationId);
    }
    
    if (data && Array.isArray(data)) {
      console.log('Fetched organization members:', data);
      // Map the response to OrganizationUser type
      const mappedUsers: OrganizationUser[] = data.map(member => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        email: member.email,
        full_name: member.full_name,
        username: member.username
      }));
      return mappedUsers;
    } else {
      console.log('No members found or invalid data format');
      return [];
    }
  } catch (err) {
    const error = err as Error;
    console.error('Error in fetchOrganizationUsers:', error);
    return fetchOrganizationUsersFallback(organizationId);
  }
}

// Fallback method using separate queries to avoid RLS recursion
export async function fetchOrganizationUsersFallback(organizationId: string): Promise<OrganizationUser[]> {
  try {
    console.log('Using fallback method to fetch organization members');
    
    // First get user IDs with roles from a direct query or custom function
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
      console.log('No members found');
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
            email: profile?.username, // Username might be email
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

// Remove a user from an organization
export async function removeUserFromOrganization(organizationId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      toast('Error removing user', { 
        style: { backgroundColor: 'red', color: 'white' } 
      });
      return false;
    }

    toast('User removed successfully', {
      style: { backgroundColor: 'green', color: 'white' }
    });
    
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    return false;
  }
}

// Update a user's role in an organization
export async function updateUserRoleInOrganization(
  organizationId: string, 
  userId: string, 
  newRole: string
): Promise<boolean> {
  try {
    // Cast newRole to the correct enum type to match database constraint
    const validRole = newRole as Database["public"]["Enums"]["role_type"];
    
    const { error } = await supabase
      .from('organization_members')
      .update({ role: validRole })
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      toast('Error updating role', { 
        style: { backgroundColor: 'red', color: 'white' } 
      });
      return false;
    }

    toast('Role updated successfully', {
      style: { backgroundColor: 'green', color: 'white' }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating role:', error);
    return false;
  }
}
