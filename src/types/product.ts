
export type ProductTemplate = {
  id: string;
  name: string;
  description?: string;
  version: string;
  category?: string;
  tags?: string;
  status?: 'draft' | 'active' | 'archived';
  organization_id: string;
  created_at: string;
  updated_at: string;
};

export type PropertyDataType = 'string' | 'number' | 'boolean' | 'location' | 'enum' | 'json' | 'datetime';

export type ProductProperty = {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  data_type: PropertyDataType;
  unit?: string;
  is_required: boolean;
  default_value?: string | number | boolean | null;
  validation_rules?: PropertyValidationRules;
  created_at: string;
  updated_at: string;
  is_template?: boolean;
  template_id?: string;
};

export type PropertyValidationRules = {
  min?: number | null;
  max?: number | null;
  pattern?: string | null;
  options?: string[] | null;
  min_length?: number | null;
  max_length?: number | null;
  precision?: number | null;
  format?: string | null;
  allowed_values?: Array<string | number | boolean> | null;
};

export type PropertyFormValues = {
  name: string;
  description?: string;
  data_type: PropertyDataType;
  unit?: string;
  is_required: boolean;
  default_value?: string | number | boolean | null;
  validation_rules?: PropertyValidationRules;
  product_id?: string;
} & Record<string, unknown>;

export type ProductService = {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  service_type: ServiceType;
  config: ServiceConfig;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceType = 
  | 'mqtt'
  | 'http'
  | 'data_processing'
  | 'analytics'
  | 'notification'
  | 'storage'
  | 'custom';

export type ServiceConfig = {
  endpoint?: string;
  auth_type?: 'none' | 'basic' | 'token' | 'oauth';
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
  };
  headers?: Record<string, string>;
  parameters?: Record<string, unknown>;
  topic?: string;
  qos?: 0 | 1 | 2;
  retention_days?: number;
  processing_rules?: Array<Record<string, unknown>>;
  notification_channels?: string[];
  [key: string]: unknown;
};

export type ServiceFormValues = {
  name: string;
  description?: string;
  service_type: ServiceType;
  enabled: boolean;
  config: Record<string, unknown>;
};

export type PropertyTemplate = {
  id: string;
  name: string;
  description?: string;
  data_type: PropertyDataType;
  unit?: string;
  is_required: boolean;
  default_value?: string | number | boolean | null;
  validation_rules?: PropertyValidationRules;
  category?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
};
