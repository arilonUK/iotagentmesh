
export interface SubscriptionTier {
  id: string;
  name: string;
  display_name: string;
  price: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  features: {
    max_devices: number;
    max_api_calls_per_month: number;
    max_data_retention_days: number;
    advanced_analytics: boolean;
    priority_support: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  subscription_plan_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageMetrics {
  id: string;
  organization_id: string;
  metric_type: string;
  metric_value: number;
  period_start: string;
  period_end: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DeviceConnection {
  id: string;
  device_id: string;
  organization_id: string;
  connection_start: string;
  connection_end?: string;
  duration_seconds?: number;
  connection_type: string;
  created_at: string;
}

export interface DataVolumeUsage {
  id: string;
  organization_id: string;
  device_id: string;
  data_type: 'ingestion' | 'egress' | 'storage';
  volume_bytes: number;
  recorded_at: string;
  period_date: string;
}

export interface CurrentUsage {
  device_count: number;
  api_calls_this_month: number;
  data_volume_mb: number;
  active_connections: number;
}

export interface UsageLimits {
  exceeds_device_limit: boolean;
  exceeds_api_limit: boolean;
  exceeds_data_limit: boolean;
  current_plan_name: string;
}
