
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

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
  createInvitation: async ({ email, role, organizationId }: CreateInvitationParams) => {
    try {
      // Generate a unique token
      const token = uuidv4();
      
      // Set expiration date (48 hours from now)
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
        toast('Error creating invitation', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        throw error;
      }

      toast('Invitation created successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
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
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        toast('Error deleting invitation', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        throw error;
      }

      toast('Invitation deleted successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      throw error;
    }
  },

  resendInvitation: async (invitationId: string) => {
    try {
      // Update the expiration date (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      const { error } = await supabase
        .from('invitations')
        .update({ 
          expires_at: expiresAt.toISOString(),
          // Optionally generate a new token
          token: uuidv4()
        })
        .eq('id', invitationId);

      if (error) {
        toast('Error resending invitation', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        throw error;
      }

      toast('Invitation resent successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  },

  acceptInvitation: async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast('You must be logged in to accept an invitation', {
          style: { backgroundColor: 'red', color: 'white' }
        });
        return false;
      }

      const { data, error } = await supabase
        .rpc('accept_invitation', { 
          p_token: token, 
          p_user_id: user.id 
        });

      if (error) {
        toast('Error accepting invitation', { 
          style: { backgroundColor: 'red', color: 'white' } 
        });
        throw error;
      }

      if (data) {
        toast('Invitation accepted successfully', {
          style: { backgroundColor: 'green', color: 'white' }
        });
        return true;
      }
      
      toast('Invalid or expired invitation', {
        style: { backgroundColor: 'red', color: 'white' }
      });
      return false;
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  }
};
