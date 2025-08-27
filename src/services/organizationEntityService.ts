
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/contexts/auth/types';
import { OrganizationData, OrganizationMember } from '@/types/organization';

/**
 * Validates a UUID string format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Fetch organization entity using bypass functions to avoid RLS recursion
 */
export async function fetchOrganizationEntity(organizationId: string, userId: string): Promise<Organization | null> {
  try {
    console.log(`Fetching organization entity: ${organizationId} for user: ${userId}`);
    
    if (!organizationId || !userId) {
      console.error('Missing required parameters for fetchOrganizationEntity');
      return null;
    }

    if (!isValidUUID(organizationId) || !isValidUUID(userId)) {
      console.error('Invalid UUID format in fetchOrganizationEntity');
      return null;
    }

    // Use the bypass function to get organization with role
    const { data: orgWithRole, error } = await supabase
      .rpc('get_organization_with_role', {
        p_org_id: organizationId,
        p_user_id: userId
      })
      .single();

    if (error) {
      console.error('Error fetching organization with role:', error);
      return null;
    }

    if (!orgWithRole) {
      console.log('No organization found or user not a member');
      return null;
    }

    console.log('Successfully fetched organization entity:', orgWithRole);
    return orgWithRole as Organization;
  } catch (error: unknown) {
    console.error('Unexpected error in fetchOrganizationEntity:', error);
    return null;
  }
}

/**
 * Fetch organization data including members using bypass functions
 */
export async function fetchOrganizationData(organizationId: string, userId: string): Promise<OrganizationData | null> {
  try {
    console.log(`Fetching organization data for org: ${organizationId}, user: ${userId}`);
    
    // Get the organization entity first
    const organization = await fetchOrganizationEntity(organizationId, userId);
    
    if (!organization) {
      console.error('Could not fetch organization entity');
      return null;
    }

    // Get organization members using bypass function
    const { data: members, error: membersError } = await supabase
      .rpc('get_organization_members_bypass_rls', {
        p_org_id: organizationId
      });

    if (membersError) {
      console.error('Error fetching organization members:', membersError);
      // Don't fail completely if members can't be fetched
    }

    const result: OrganizationData = {
      ...(organization as Organization),
      members: (members as OrganizationMember[]) || []
    };

    console.log('Successfully fetched complete organization data:', result);
    return result;
  } catch (error: unknown) {
    console.error('Unexpected error in fetchOrganizationData:', error);
    return null;
  }
}
