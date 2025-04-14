
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { organizationService } from './organizationService';
import { organizationSetupService as organizationDefaultSetupService } from '@/services/organizationSetupService';

export const organizationSetupService = {  
  ensureUserHasOrganization: async (userId: string, userEmail: string): Promise<string | null> => {
    try {
      // First check if the user already has organizations
      const userOrgs = await organizationService.getUserOrganizations(userId);
      
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
      
      // Set up default permissions for the organization
      await organizationDefaultSetupService.setupDefaultPermissions(newOrg.id);
      
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
