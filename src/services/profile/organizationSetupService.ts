
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { organizationService } from './organizationService';
import { organizationSetupService as organizationDefaultSetupService } from '@/services/organizationSetupService';

const assignFreePlanToOrganization = async (organizationId: string): Promise<boolean> => {
  try {
    console.log('Assigning free plan to organization:', organizationId);
    
    // Get the free plan
    const { data: freePlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('name', 'free')
      .eq('is_active', true)
      .single();

    if (planError || !freePlan) {
      console.error('Error finding free plan:', planError);
      return false;
    }

    // Check if organization already has a subscription
    const { data: existingSubscription } = await supabase
      .from('organization_subscriptions')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      console.log('Organization already has an active subscription');
      return true;
    }

    // Create subscription for the organization
    const { error: subscriptionError } = await supabase
      .from('organization_subscriptions')
      .insert({
        organization_id: organizationId,
        subscription_plan_id: freePlan.id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now for free plan
      });

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return false;
    }

    console.log('Successfully assigned free plan to organization:', organizationId);
    return true;
  } catch (error) {
    console.error('Error assigning free plan:', error);
    return false;
  }
};

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
      
      // Assign free plan to the new organization
      const freePlanAssigned = await assignFreePlanToOrganization(newOrg.id);
      if (!freePlanAssigned) {
        console.warn('Failed to assign free plan to organization, but continuing...');
      }
      
      // Set as default organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ default_organization_id: newOrg.id })
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error updating default organization in profile:', profileError);
      }
      
      toast('Default organization created with free plan', {
        style: { backgroundColor: 'green', color: 'white' }
      });
      
      return newOrg.id;
    } catch (error: any) {
      console.error('Error ensuring user has organization:', error);
      return null;
    }
  }
};
