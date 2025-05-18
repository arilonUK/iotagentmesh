
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  created_at: string;
  expires_at: string | null;
  last_used: string | null;
  is_active: boolean;
}

export type ApiKeyScope = 'read' | 'write' | 'devices' | 'users' | 'analytics';

export interface NewApiKeyFormData {
  name: string;
  scopes: string[];
  expiration: string;
}
