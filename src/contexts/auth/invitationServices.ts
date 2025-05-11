import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { createAuditLog } from '@/services/auditLogService';

export type InvitationType = {
  id: string;
  organization_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  token: string;
  created_at: string;
  expires_at: string;
};

export type CreateInvitationParams = {
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  organizationId: string;
};

export const invitationServices = {
  signUp: async (email: string, password: string, userData?: { full_name?: string; username?: string; organization_name?: string }) => {
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
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      if (userData?.organization_name) {
        // Create a new organization for the user
        const { data: organization, error: orgError } = await supabase
          .from('organizations')
          .insert([{ name: userData.organization_name, slug: userData.organization_name.toLowerCase().replace(/ /g, '-') }])
          .select('*')
          .single();

        if (orgError) {
          toast({
            title: "Error",
            description: orgError.message,
            variant: "destructive"
          });
          throw orgError;
        }

        // Add the user as an owner to the organization
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert([{ organization_id: organization.id, user_id: data.user?.id, role: 'owner' }]);

        if (memberError) {
          toast({
            title: "Error",
            description: memberError.message,
            variant: "destructive"
          });
          throw memberError;
        }
      }

      toast({
        title: "Success",
        description: "Account created successfully. Check your email to verify your account.",
      });
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  createInvitation: async ({ email, role, organizationId }: CreateInvitationParams) => {
    try {
      const token = uuidv4();
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      const { data, error } = await supabase
        .from('invitations')
        .insert([{
          organization_id: organizationId,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString()
        }])
        .select('*')
        .single();

      if (error) {
        toast.error(error.message);
        throw error;
      }

      // Create audit log entry
      await createAuditLog(
        organizationId, 
        'invitation_sent', 
        { email, role }
      );

      toast.success("Invitation created successfully");
      return data;
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  },

  getOrganizationInvitations: async (organizationId: string): Promise<InvitationType[]> => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return [];
      }

      return data as InvitationType[];
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      return [];
    }
  },

  deleteInvitation: async (invitationId: string) => {
    try {
      // Get invitation details for the audit log
      const { data: invitation } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single();
        
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (invitation) {
        // Create audit log entry
        await createAuditLog(
          invitation.organization_id, 
          'invitation_deleted', 
          { email: invitation.email, role: invitation.role }
        );
      }

      toast.success("Invitation deleted successfully");
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      throw error;
    }
  },

  resendInvitation: async (invitationId: string) => {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      const { error } = await supabase
        .from('invitations')
        .update({ 
          expires_at: expiresAt.toISOString(),
          token: uuidv4()
        })
        .eq('id', invitationId);

      if (error) {
        toast.error('Error resending invitation: ' + error.message);
        throw error;
      }

      toast.success('Invitation resent successfully');
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  },

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
