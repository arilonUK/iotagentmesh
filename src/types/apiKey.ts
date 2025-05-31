
export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key_hash: string;
  prefix: string;
  scopes: string[];
  expires_at: string | null;
  last_used: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiUsage {
  id: string;
  api_key_id: string;
  organization_id: string;
  endpoint: string;
  method: string;
  status_code: number | null;
  response_time_ms: number | null;
  request_size_bytes: number | null;
  response_size_bytes: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface RateLimitBucket {
  id: string;
  api_key_id: string;
  bucket_type: 'hourly' | 'daily' | 'monthly';
  current_count: number;
  limit_value: number;
  reset_time: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  requests_per_hour: number | null;
  requests_per_month: number | null;
  concurrent_connections: number | null;
  max_api_keys: number | null;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ApiKeyScope = 'read' | 'write' | 'devices' | 'users' | 'analytics' | 'basic_write';

export interface NewApiKeyFormData {
  name: string;
  scopes: string[];
  expiration: string;
}

export interface CreateApiKeyResponse {
  api_key: ApiKey;
  full_key: string; // The unhashed key - only returned once
}
