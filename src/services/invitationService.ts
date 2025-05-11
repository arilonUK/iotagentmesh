
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { createAuditLog } from '@/services/auditLogService';
import { InvitationType, CreateInvitationParams } from '@/types/invitation';

/**
 * Services for managing organization invitations
 */
export const invitationService = {
  /**
   * Create a new invitation for a user to join an organization
   */
  createInvitation: async ({ email, role, organizationId }: CreateInvitationParams) => {
    try {
      // Generate expiration date (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      // Generate a secure invitation token
      const token = uuidv4();
      
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
      return data as InvitationType;
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  },

  /**
   * Get all pending invitations for an organization
   */
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

  /**
   * Delete an invitation by its ID
   */
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
      return true;
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      throw error;
    }
  },

  /**
   * Resend an invitation by refreshing its expiration date and token
   */
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
      return true;
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  }
};
