
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { UserData } from '@/contexts/auth/types';

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
      }

      toast.success("Account created successfully. Check your email to verify your account.");
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  }
};
