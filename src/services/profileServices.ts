
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile, UserOrganization } from '@/contexts/auth/types';
import { Database } from '@/integrations/supabase/types';

export const profileServices = {
  updateProfile: async (profileData: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        toast('Error updating profile', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        throw error;
      }

      toast('Profile updated successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  getUserOrganizations: async (userId: string): Promise<UserOrganization[]> => {
    try {
      console.log('Getting user organizations for user ID:', userId);
      
      // First try the RPC method
      try {
        const { data, error } = await supabase
          .rpc('get_user_organizations', { p_user_id: userId });

        if (error) {
          console.error('Error fetching user organizations with RPC:', error);
          throw error; // Throw to trigger fallback
        }

        if (data && data.length > 0) {
          console.log('Successfully fetched user organizations with RPC:', data);
          return data as UserOrganization[];
        } else {
          console.log('No organizations found for user with RPC method');
        }
      } catch (rpcError) {
        console.error('RPC method failed, falling back to direct query:', rpcError);
      }
      
      // Fallback to direct query if RPC fails or returns no data
      console.log('Using fallback method to fetch organizations');
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
    } catch (error: any) {
      console.error('Error fetching user organizations:', error);
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
  },
  
  ensureUserHasOrganization: async (userId: string, userEmail: string): Promise<string | null> => {
    try {
      // First check if the user already has organizations
      const userOrgs = await profileServices.getUserOrganizations(userId);
      
      if (userOrgs && userOrgs.length > 0) {
        console.log('User already has organizations:', userOrgs);
        return userOrgs[0].id;
      }
      
      // User has no organizations, let's create one
      console.log('Creating default organization for user', userId);
      const username = userEmail.split('@')[0];
      const orgName = `${username}'s Organization`;
      const orgSlug = `org-${Math.random().toString(36).substring(2, 10)}`;
      
      // Create the organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          slug: orgSlug
        })
        .select()
        .single();
        
      if (orgError) {
        console.error('Error creating default organization:', orgError);
        return null;
      }
      
      console.log('Created new organization:', newOrg);
      
      // Add the user as an owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: newOrg.id,
          user_id: userId,
          role: 'owner' as Database['public']['Enums']['role_type']
        });
        
      if (memberError) {
        console.error('Error adding user to organization:', memberError);
        return null;
      }
      
      // Set as default organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ default_organization_id: newOrg.id })
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error updating default organization in profile:', profileError);
      }
      
      toast('Default organization created', {
        style: { backgroundColor: 'green', color: 'white' }
      });
      
      return newOrg.id;
    } catch (error: any) {
      console.error('Error ensuring user has organization:', error);
      return null;
    }
  }
};
