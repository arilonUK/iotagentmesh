
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserOrganization } from '@/contexts/auth/types';
import { Database } from '@/integrations/supabase/types';

export const organizationService = {
  getUserOrganizations: async (userId: string): Promise<UserOrganization[]> => {
    try {
      console.log('Getting user organizations for user ID:', userId);
      
      // Use the RPC method which should now work with fixed RLS policies
      const { data, error } = await supabase
        .rpc('get_user_organizations', { p_user_id: userId });

      if (error) {
        console.error('Error fetching user organizations with RPC:', error);
        
        // If RPC fails, try direct query fallback
        return await getUserOrganizationsFallback(userId);
      }

      if (data && data.length > 0) {
        console.log('Successfully fetched user organizations with RPC:', data);
        return data as UserOrganization[];
      } else {
        console.log('No organizations found for user with RPC method');
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching user organizations:', error);
      // Try fallback method
      return await getUserOrganizationsFallback(userId);
    }
  },

  switchOrganization: async (userId: string, organizationId: string): Promise<boolean> => {
    try {
      // Try the RPC method first
      console.log(`Switching organization to ${organizationId} for user ${userId} using RPC`);
      const { data, error } = await supabase
        .rpc('switch_user_organization', {
          p_user_id: userId,
          p_org_id: organizationId
        });

      if (error) {
        console.error('Error switching organization with RPC:', error);
        throw error;
      }

      if (data) {
        toast('Organization switched successfully', {
          style: { backgroundColor: 'green', color: 'white' }
        });
        return true;
      }

      // Fallback to direct update if RPC doesn't return data
      return await switchOrganizationFallback(userId, organizationId);
    } catch (rpcError) {
      console.error('RPC method failed, falling back to direct query:', rpcError);
      return await switchOrganizationFallback(userId, organizationId);
    }
  }
};

// Fallback method for getting user organizations
async function getUserOrganizationsFallback(userId: string): Promise<UserOrganization[]> {
  try {
    console.log('Using fallback method to fetch organizations');
    
    // Get organization memberships for the user
    const { data: orgMembers, error: membersError } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', userId);
      
    if (membersError) {
      console.error('Error fetching organization memberships:', membersError);
      return [];
    }
    
    if (!orgMembers || orgMembers.length === 0) {
      console.log('No organization memberships found');
      return [];
    }
    
    // Fetch organization details and user's default organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userId)
      .single();
    
    const orgs: UserOrganization[] = [];
    
    for (const member of orgMembers) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('id', member.organization_id)
        .single();
        
      if (orgError) {
        console.error('Error fetching organization details:', orgError);
        continue;
      }
      
      if (org) {
        orgs.push({
          id: org.id,
          name: org.name,
          slug: org.slug,
          role: member.role,
          is_default: profile?.default_organization_id === org.id
        });
      }
    }
    
    console.log('Final organizations list from fallback method:', orgs);
    return orgs;
  } catch (error: any) {
    console.error('Fallback method failed:', error);
    return [];
  }
}

// Fallback method for switching organizations
async function switchOrganizationFallback(userId: string, organizationId: string): Promise<boolean> {
  try {
    console.log('Using fallback method to switch organization');
    
    // Check if user is a member of the organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .maybeSingle();
      
    if (membershipError) {
      console.error('Error checking organization membership:', membershipError);
      toast('Error switching organization', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      return false;
    }
    
    if (!membership) {
      toast('You are not a member of this organization', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      return false;
    }
    
    // Update default organization
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ default_organization_id: organizationId })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating default organization:', updateError);
      toast('Error switching organization', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      return false;
    }
    
    toast('Organization switched successfully', {
      style: { backgroundColor: 'green', color: 'white' }
    });
    return true;
  } catch (error: any) {
    console.error('Error in fallback switch method:', error);
    toast('Error switching organization', {
      style: { backgroundColor: 'red', color: 'white' }
    });
    return false;
  }
}
