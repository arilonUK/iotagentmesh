
import { supabase } from '@/integrations/supabase/client';
import { AuditLogEntry, AuditLogFilterOptions, AuditLogAction } from './types';

/**
 * Fetch audit logs for an organization
 */
export const fetchAuditLogs = async (
  organizationId: string,
  options: AuditLogFilterOptions = {}
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
    
    // Call RPC function to get audit logs with filtering
    const { data, error } = await supabase.rpc('get_audit_logs', {
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
    
    // Cast the returned data to our AuditLogEntry type
    return {
      logs: data as AuditLogEntry[] || [],
      count: Array.isArray(data) ? data.length : 0,
    };
  } catch (error) {
    console.error('Exception in fetchAuditLogs:', error);
    return { logs: [], count: 0 };
  }
};
