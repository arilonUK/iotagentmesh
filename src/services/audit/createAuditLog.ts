
import { supabase } from '@/integrations/supabase/client';
import { AuditLogAction } from './types';

/**
 * Creates an audit log entry
 */
export const createAuditLog = async (
  organizationId: string,
  action: AuditLogAction,
  details: Record<string, unknown> = {}
): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Call the RPC function to create an audit log entry
    const { data, error } = await supabase.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: user.id,
      p_action: action,
      p_details: details
    });
      
    if (error) {
      console.error('Error creating audit log:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Exception in createAuditLog:', error);
    return false;
  }
};
