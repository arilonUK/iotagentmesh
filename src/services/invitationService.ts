
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InvitationType, CreateInvitationParams } from '@/contexts/auth/invitationServices';

export const invitationService = {
  createInvitation: async ({ email, role, organizationId }: CreateInvitationParams) => {
    try {
      // Generate expiration date (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      // Generate a secure invitation token
      const token = crypto.randomUUID();
      
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
        if (error.code === '23505') { // Unique violation error code
          toast.error('This email already has a pending invitation');
        } else {
          toast.error(`Error creating invitation: ${error.message}`);
        }
        throw error;
      }

      toast.success('Invitation sent successfully');
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
        toast.error(`Error fetching invitations: ${error.message}`);
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
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        toast.error(`Error deleting invitation: ${error.message}`);
        throw error;
      }

      toast.success('Invitation deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      throw error;
    }
  },

  resendInvitation: async (invitationId: string) => {
    try {
      // Generate a new token and reset expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      const { error } = await supabase
        .from('invitations')
        .update({ 
          expires_at: expiresAt.toISOString(),
          token: crypto.randomUUID()
        })
        .eq('id', invitationId);

      if (error) {
        toast.error(`Error resending invitation: ${error.message}`);
        throw error;
      }

      toast.success('Invitation resent successfully');
      return true;
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  }
};
