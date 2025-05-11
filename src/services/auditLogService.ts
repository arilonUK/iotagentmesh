
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
    
    // Add the audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        action,
        details,
        // Browser info is automatically captured by Supabase
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
    
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    
    // Add filters if provided
    if (action) {
      query = query.eq('action', action);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], count: 0 };
    }
    
    return {
      logs: data as AuditLogEntry[],
      count: count || 0,
    };
  } catch (error) {
    console.error('Exception in fetchAuditLogs:', error);
    return { logs: [], count: 0 };
  }
};
