
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { UserData } from '@/contexts/auth/types';

// Create a simplified audit log function to replace the missing createAuditLog function
const createAuditLog = async (
  organizationId: string,
  action: string,
  details: Record<string, unknown>
) => {
  try {
    await supabase.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_action: action,
      p_details: details
    });
    return true;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return false;
  }
};

// Helper function to assign free plan to organization
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

/**
 * Services related to authentication and invitation handling
 */
export const authInvitationService = {
  /**
   * User sign-up with optional organization creation
   */
  signUp: async (email: string, password: string, userData?: UserData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name,
            username: userData?.username,
          },
        },
      });

      if (error) {
        toast.error("Error: " + error.message);
        throw error;
      }

      if (userData?.organization_name && data.user) {
        // Create a new organization for the user
        const { data: organization, error: orgError } = await supabase
          .from('organizations')
          .insert([{ 
            name: userData.organization_name, 
            slug: userData.organization_name.toLowerCase().replace(/ /g, '-') 
          }])
          .select('*')
          .single();

        if (orgError) {
          toast.error("Error: " + orgError.message);
          throw orgError;
        }

        // Add the user as an owner to the organization
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert([{ 
            organization_id: organization.id, 
            user_id: data.user.id, 
            role: 'owner' 
          }]);

        if (memberError) {
          toast.error("Error: " + memberError.message);
          throw memberError;
        }

        // Assign free plan to the new organization
        const freePlanAssigned = await assignFreePlanToOrganization(organization.id);
        if (!freePlanAssigned) {
          console.warn('Failed to assign free plan to organization during signup');
        }
      }

      toast.success("Account created successfully. Check your email to verify your account.");
    } catch (error: unknown) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  /**
   * Accept an invitation to join an organization
   */
  acceptInvitation: async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to accept an invitation');
        return false;
      }

      // Use a raw query instead of rpc to work around type issues
      const { data, error } = await supabase.from('invitations')
        .select('organization_id, role, email')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        toast.error('Invalid or expired invitation');
        return false;
      }
      
      // Add user to organization with the specified role
      const { error: memberError } = await supabase.from('organization_members')
        .insert({
          organization_id: data.organization_id,
          user_id: user.id,
          role: data.role
        });
        
      if (memberError) {
        toast.error('Error accepting invitation: ' + memberError.message);
        throw memberError;
      }
      
      // Create audit log entry
      await createAuditLog(
        data.organization_id, 
        'invitation_accepted', 
        { user_id: user.id, role: data.role, email: data.email }
      );
      
      // Delete the invitation after it's been accepted
      await supabase.from('invitations')
        .delete()
        .eq('token', token);
      
      toast.success('Invitation accepted successfully');
      return true;
    } catch (error: unknown) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  }
};
