
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrganizationUser } from '@/types/organization';
import { isFallbackOrganization } from './organizationUtils';
import { createFallbackMembersList } from './fallbackMembersService';

// Fetch organization members from the database using secure functions
export async function fetchOrganizationMembers(organizationId: string): Promise<OrganizationUser[]> {
  try {
    console.log('Fetching members for organization:', organizationId);
    
    // Handle fallback organizations
    if (isFallbackOrganization(organizationId)) {
      console.log('Detected fallback organization, returning current user as owner');
      return createFallbackMembersList();
    }
    
    // Use the secure RPC function to get organization members
    const { data, error } = await supabase.rpc('get_organization_members', 
      { p_org_id: organizationId }
    );
    
    if (error) {
      console.error('Error fetching organization members:', error);
      // If RPC fails, the RLS policies will handle access control
      toast.error('Error loading team members');
      return [];
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
    toast.error('Error loading team members');
    return [];
  }
}
