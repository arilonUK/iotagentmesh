
export type AlarmSeverity = 'info' | 'warning' | 'critical';
export type AlarmStatus = 'active' | 'acknowledged' | 'resolved';
export type ConditionOperator = 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'between' | 'outside';

export interface AlarmDevice {
  id: string;
  name: string;
  type: string;
}

export interface AlarmConfig {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  device_id: string | null;
  device?: AlarmDevice;
  enabled: boolean;
  reading_type: string;
  condition_operator: ConditionOperator;
  condition_value: Record<string, unknown>;
  severity: AlarmSeverity;
  cooldown_minutes: number;
  created_at: string;
  updated_at: string;
  endpoints: string[];
}

export interface AlarmEvent {
  id: string;
  alarm_id: string;
  device_id: string | null;
  status: AlarmStatus;
  triggered_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  acknowledged_by: string | null;
  trigger_value: number | null;
  message: string;
  alarm?: {
    name: string;
    description?: string;
    severity: AlarmSeverity;
  };
  device?: {
    name: string;
    type: string;
  };
}

export interface AlarmFormData {
  id?: string;  // Make id optional but available for form data
  name: string;
  description?: string;
  device_id: string | null;
  enabled: boolean;
  reading_type: string;
  condition_operator: ConditionOperator;
  condition_value: Record<string, unknown>;
  severity: AlarmSeverity;
  cooldown_minutes?: number;
  endpoints: string[];
}

export interface AlarmStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  byDevice: Record<string, number>;
  byType: Record<string, number>;
  bySeverity: {
    info: number;
    warning: number;
    critical: number;
  };
}
