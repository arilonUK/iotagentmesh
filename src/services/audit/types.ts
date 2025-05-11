
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

export interface AuditLogFilterOptions {
  limit?: number;
  page?: number;
  action?: AuditLogAction;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}
