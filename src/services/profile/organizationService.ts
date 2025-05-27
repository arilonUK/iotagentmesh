
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserOrganization } from '@/contexts/auth/types';
import { Database } from '@/integrations/supabase/types';

export const organizationService = {
  getUserOrganizations: async (userId: string): Promise<UserOrganization[]> => {
    try {
      console.log('Getting user organizations for user ID:', userId);
      
      // First try the RPC method with better error handling
      try {
        const { data, error } = await supabase
          .rpc('get_user_organizations', { p_user_id: userId });

        if (error) {
          // Check for infinite recursion error specifically
          if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
            console.error('Infinite recursion detected in RLS policy. This needs to be fixed in the database.');
            // Return empty array to allow basic auth to continue
            return [];
          }
          console.error('Error fetching user organizations with RPC:', error);
          throw error; // Throw to trigger fallback
        }

        if (data && data.length > 0) {
          console.log('Successfully fetched user organizations with RPC:', data);
          return data as UserOrganization[];
        } else {
          console.log('No organizations found for user with RPC method');
        }
      } catch (rpcError: any) {
        console.error('RPC method failed, falling back to direct query:', rpcError);
        
        // If it's an infinite recursion error, don't try fallback as it will also fail
        if (rpcError.code === '42P17' || rpcError.message?.includes('infinite recursion')) {
          console.error('Infinite recursion error detected. Returning empty organizations to allow basic auth.');
          return [];
        }
      }
      
      // Fallback to direct query if RPC fails or returns no data
      console.log('Using fallback method to fetch organizations');
      
      try {
        const { data: orgMembers, error: membersError } = await supabase
          .from('organization_members')
          .select('organization_id, role')
          .eq('user_id', userId);
          
        if (membersError) {
          // Handle infinite recursion in fallback too
          if (membersError.code === '42P17' || membersError.message?.includes('infinite recursion')) {
            console.error('Infinite recursion in fallback query too. Database policies need fixing.');
            return [];
          }
          console.error('Error fetching organization memberships:', membersError);
          return [];
        }
        
        if (!orgMembers || orgMembers.length === 0) {
          console.log('No organization memberships found');
          return [];
        }
        
        // Fetch organization details for each membership
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
        
        console.log('Final organizations list from direct query:', orgs);
        return orgs;
      } catch (fallbackError: any) {
        console.error('Fallback method also failed:', fallbackError);
        // Always return empty array to allow basic auth to continue
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching user organizations:', error);
      // Always return empty array to allow basic auth to continue
      return [];
    }
  },

  switchOrganization: async (userId: string, organizationId: string): Promise<boolean> => {
    try {
      // First try the RPC method
      try {
        console.log(`Switching organization to ${organizationId} for user ${userId} using RPC`);
        const { data, error } = await supabase
          .rpc('switch_user_organization', {
            p_user_id: userId,
            p_org_id: organizationId
          });

        if (error) {
          console.error('Error switching organization with RPC:', error);
          throw error; // Throw to trigger fallback
        }

        if (data) {
          toast('Organization switched successfully', {
            style: { backgroundColor: 'green', color: 'white' }
          });
          return true;
        }
      } catch (rpcError) {
        console.error('RPC method failed, falling back to direct query:', rpcError);
      }
      
      // Fallback to direct query if RPC fails
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
      console.error('Error switching organization:', error);
      return false;
    }
  }
};
