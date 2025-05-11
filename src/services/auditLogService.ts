
import { supabase } from '@/integrations/supabase/client';

export type AuditLogAction = 
  | 'member_added'
  | 'member_removed'
  | 'role_updated'
  | 'invitation_sent'
  | 'invitation_deleted'
  | 'invitation_accepted'
  | 'organization_updated'
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'device_created'
  | 'device_deleted'
  | 'product_created'
  | 'product_deleted';

export interface AuditLogEntry {
  id: string;
  organization_id: string;
  user_id: string;
  action: AuditLogAction;
  details: Record<string, any>;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Creates an audit log entry
 */
export const createAuditLog = async (
  organizationId: string,
  action: AuditLogAction,
  details: Record<string, any> = {}
): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Using rpc function to bypass type checking since 'audit_logs' table
    // might not be included in the generated types yet
    const { error } = await supabase.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: user.id,
      p_action: action,
      p_details: details
    });
      
    if (error) {
      console.error('Error creating audit log:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in createAuditLog:', error);
    return false;
  }
};

/**
 * Fetch audit logs for an organization
 */
export const fetchAuditLogs = async (
  organizationId: string,
  options: {
    limit?: number;
    page?: number;
    action?: AuditLogAction;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<{ logs: AuditLogEntry[], count: number }> => {
  try {
    const {
      limit = 50,
      page = 0,
      action,
      userId,
      startDate,
      endDate,
    } = options;
    
    // Using rpc function to bypass type checking since 'audit_logs' table
    // might not be included in the generated types yet
    const { data, error, count } = await supabase.rpc('get_audit_logs', {
      p_organization_id: organizationId,
      p_limit: limit,
      p_offset: page * limit,
      p_action: action || null,
      p_user_id: userId || null,
      p_start_date: startDate?.toISOString() || null,
      p_end_date: endDate?.toISOString() || null
    });
    
    if (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], count: 0 };
    }
    
    // Since we're using an RPC call, we need to cast the returned data to our AuditLogEntry type
    return {
      logs: (data || []) as AuditLogEntry[],
      count: count || 0,
    };
  } catch (error) {
    console.error('Exception in fetchAuditLogs:', error);
    return { logs: [], count: 0 };
  }
};
