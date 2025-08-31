
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Security service for monitoring and logging security events
 */
export const securityService = {
  /**
   * Log security events for monitoring
   */
  logSecurityEvent: async (
    eventType: 'failed_login' | 'suspicious_activity' | 'permission_denied' | 'data_access_violation',
    details: Record<string, unknown>
  ) => {
    try {
      // Get current user if available
      const { data: { user } } = await supabase.auth.getUser();
      
      // For now, we'll use the existing audit log function
      // In production, you might want a separate security_events table
      if (user) {
        const { data: userOrgs } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1);

        if (userOrgs && userOrgs.length > 0) {
          await supabase.rpc('create_audit_log_entry', {
            p_organization_id: userOrgs[0].organization_id,
            p_user_id: user.id,
            p_action: `security_event_${eventType}`,
            p_details: {
              event_type: eventType,
              timestamp: new Date().toISOString(),
              ...details
            }
          });
        }
      }
      
      // Also log to console for development
      console.warn(`Security Event: ${eventType}`, details);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  },

  /**
   * Validate invitation tokens securely
   */
  validateInvitationToken: async (token: string): Promise<boolean> => {
    try {
      if (!token || token.length < 32) {
        await securityService.logSecurityEvent('suspicious_activity', {
          reason: 'Invalid invitation token format',
          token_length: token?.length || 0
        });
        return false;
      }

      // Use direct query instead of RPC function
      const { data, error } = await supabase
        .from('invitations')
        .select('id')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      if (error || !data || data.length === 0) {
        await securityService.logSecurityEvent('suspicious_activity', {
          reason: 'Invalid or expired invitation token',
          error: error?.message
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  /**
   * Check if user has permission for organization action
   */
  checkOrganizationPermission: async (
    organizationId: string,
    requiredRole: 'member' | 'admin' | 'owner' = 'member'
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        await securityService.logSecurityEvent('permission_denied', {
          reason: 'No authenticated user',
          organization_id: organizationId,
          required_role: requiredRole
        });
        return false;
      }

      // Use direct query instead of RPC function
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();

      if (!memberData) {
        await securityService.logSecurityEvent('permission_denied', {
          reason: 'User not member of organization',
          organization_id: organizationId,
          user_id: user.id
        });
        return false;
      }

      // Check role hierarchy
      const roleHierarchy = { viewer: 0, member: 1, admin: 2, owner: 3 };
      const userRoleLevel = roleHierarchy[memberData.role as keyof typeof roleHierarchy] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        await securityService.logSecurityEvent('permission_denied', {
          reason: 'Insufficient role permissions',
          organization_id: organizationId,
          user_id: user.id,
          user_role: memberData.role,
          required_role: requiredRole
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      await securityService.logSecurityEvent('permission_denied', {
        reason: 'Permission check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  },

  /**
   * Secure data access wrapper
   */
  secureDataAccess: async <T>(
    operation: () => Promise<T>,
    organizationId: string,
    requiredRole: 'member' | 'admin' | 'owner' = 'member'
  ): Promise<T | null> => {
    try {
      const hasPermission = await securityService.checkOrganizationPermission(
        organizationId,
        requiredRole
      );

      if (!hasPermission) {
        toast.error('You do not have permission to perform this action');
        return null;
      }

      return await operation();
    } catch (error) {
      console.error('Secure data access error:', error);
      await securityService.logSecurityEvent('data_access_violation', {
        organization_id: organizationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Access denied');
      return null;
    }
  }
};
