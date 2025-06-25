
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { OrgMemberResponse, OrganizationUser, RoleType } from '@/types/organization';
import { createAuditLog } from '@/services/audit/createAuditLog';

// Check if organization ID is a fallback (not a real UUID)
function isFallbackOrganization(orgId: string): boolean {
  return orgId.startsWith('default-org-');
}

// Fetch organization members from the database
export async function fetchOrganizationMembers(organizationId: string): Promise<OrganizationUser[]> {
  try {
    console.log('Fetching members for organization:', organizationId);
    
    // Handle fallback organizations
    if (isFallbackOrganization(organizationId)) {
      console.log('Detected fallback organization, returning current user as owner');
      return createFallbackMembersList();
    }
    
    const { data, error } = await supabase.rpc('get_organization_members', 
      { p_org_id: organizationId }
    );
    
    if (error) {
      console.error('Error fetching organization members:', error);
      return fetchOrganizationUsersFallback(organizationId);
    }
    
    if (data && Array.isArray(data)) {
      console.log(`Fetched ${data.length} organization members`);
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
    console.error('Error in fetchOrganizationMembers:', error);
    return fetchOrganizationUsersFallback(organizationId);
  }
}

// Create a fallback members list for default organizations
async function createFallbackMembersList(): Promise<OrganizationUser[]> {
  try {
    // Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .maybeSingle();
    
    const fallbackMember: OrganizationUser = {
      id: `member-${user.id}`,
      user_id: user.id,
      role: 'owner',
      email: user.email || profile?.username || 'Unknown',
      full_name: profile?.full_name || 'Unknown User',
      username: profile?.username || user.email || 'Unknown'
    };
    
    console.log('Created fallback member:', fallbackMember);
    return [fallbackMember];
  } catch (error) {
    console.error('Error creating fallback members list:', error);
    return [];
  }
}

// Fallback method using separate queries
export async function fetchOrganizationUsersFallback(organizationId: string): Promise<OrganizationUser[]> {
  try {
    console.log('Using fallback method to fetch organization members');
    
    // Handle fallback organizations
    if (isFallbackOrganization(organizationId)) {
      return createFallbackMembersList();
    }
    
    // First get user IDs with roles from organization_members table
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
    toast.error('Error loading team members');
    return [];
  }
}

// Remove a user from an organization
export async function removeOrganizationMember(organizationId: string, userId: string): Promise<boolean> {
  try {
    // Handle fallback organizations
    if (isFallbackOrganization(organizationId)) {
      toast.error('Cannot remove members from fallback organization');
      return false;
    }
    
    // Get user details for audit log
    const { data: userData } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', userId)
      .single();
    
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Error removing user'); 
      return false;
    }
    
    // Create audit log entry
    await createAuditLog(
      organizationId, 
      'member_removed', 
      { 
        user_id: userId,
        username: userData?.username,
        full_name: userData?.full_name 
      }
    );

    toast.success('User removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    return false;
  }
}

// Update a user's role
export async function updateOrganizationMemberRole(
  organizationId: string, 
  userId: string, 
  newRole: string
): Promise<boolean> {
  try {
    // Handle fallback organizations
    if (isFallbackOrganization(organizationId)) {
      toast.error('Cannot update roles in fallback organization');
      return false;
    }
    
    // Get current role before update for audit log
    const { data: currentMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();
    
    const oldRole = currentMember?.role;
    
    // Get user details for audit log
    const { data: userData } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', userId)
      .single();
    
    // Cast newRole to the correct enum type to match database constraint
    const validRole = newRole as Database["public"]["Enums"]["role_type"];
    
    const { error } = await supabase
      .from('organization_members')
      .update({ role: validRole })
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Error updating role');
      return false;
    }

    // Create audit log entry
    await createAuditLog(
      organizationId, 
      'role_updated', 
      { 
        user_id: userId,
        username: userData?.username,
        full_name: userData?.full_name,
        old_role: oldRole, 
        new_role: newRole 
      }
    );

    toast.success('Role updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating role:', error);
    return false;
  }
}
