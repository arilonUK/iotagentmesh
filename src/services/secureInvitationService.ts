
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateSecureToken } from '@/lib/security';
import { securityService } from './securityService';
import { InvitationType, CreateInvitationParams } from '@/types/invitation';

/**
 * Enhanced invitation service with security improvements
 */
export const secureInvitationService = {
  /**
   * Create a secure invitation with enhanced token generation
   */
  createSecureInvitation: async ({ email, role, organizationId }: CreateInvitationParams) => {
    try {
      // Check permissions
      const hasPermission = await securityService.checkOrganizationPermission(
        organizationId,
        'admin'
      );

      if (!hasPermission) {
        return null;
      }

      // Generate secure token
      const token = generateSecureToken();
      
      // Set expiration (48 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const { data, error } = await supabase
        .from('invitations')
        .insert([{
          organization_id: organizationId,
          email: email.toLowerCase().trim(), // Normalize email
          role,
          token,
          expires_at: expiresAt.toISOString()
        }])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating secure invitation:', error);
        toast.error(error.message);
        return null;
      }

      // Log the invitation creation
      await securityService.logSecurityEvent('suspicious_activity', {
        reason: 'Invitation created',
        email,
        role,
        organization_id: organizationId
      });

      toast.success("Secure invitation created successfully");
      return data as InvitationType;
    } catch (error: unknown) {
      console.error('Error creating secure invitation:', error);
      toast.error('Failed to create invitation');
      return null;
    }
  },

  /**
   * Accept invitation with security validation
   */
  acceptSecureInvitation: async (token: string) => {
    try {
      // Validate token format and existence
      const isValidToken = await securityService.validateInvitationToken(token);
      
      if (!isValidToken) {
        toast.error('Invalid or expired invitation');
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to accept an invitation');
        return false;
      }

      // Get invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invitationError || !invitation) {
        await securityService.logSecurityEvent('suspicious_activity', {
          reason: 'Attempt to use invalid invitation token',
          token: token.substring(0, 8) + '...' // Log only partial token
        });
        toast.error('Invalid or expired invitation');
        return false;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', invitation.organization_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast.error('You are already a member of this organization');
        return false;
      }

      // Add user to organization
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: invitation.organization_id,
          user_id: user.id,
          role: invitation.role
        });

      if (memberError) {
        console.error('Error accepting invitation:', memberError);
        toast.error('Failed to accept invitation');
        return false;
      }

      // Delete the invitation
      await supabase
        .from('invitations')
        .delete()
        .eq('token', token);

      // Log successful acceptance
      await securityService.logSecurityEvent('suspicious_activity', {
        reason: 'Invitation accepted',
        user_id: user.id,
        organization_id: invitation.organization_id,
        role: invitation.role
      });

      toast.success('Invitation accepted successfully');
      return true;
    } catch (error: unknown) {
      console.error('Error accepting secure invitation:', error);
      toast.error('Failed to accept invitation');
      return false;
    }
  }
};
