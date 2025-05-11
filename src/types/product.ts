
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
  default_value?: any;
  validation_rules?: PropertyValidationRules;
  created_at: string;
  updated_at: string;
  is_template?: boolean;
  template_id?: string;
};

export type PropertyValidationRules = {
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
  min_length?: number;
  max_length?: number;
  precision?: number;
  format?: string;
  allowed_values?: any[];
};

export type PropertyFormValues = Omit<ProductProperty, 'id' | 'product_id' | 'created_at' | 'updated_at'>;

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
  parameters?: Record<string, any>;
  topic?: string;
  qos?: 0 | 1 | 2;
  retention_days?: number;
  processing_rules?: any[];
  notification_channels?: string[];
  [key: string]: any;
};

export type ServiceFormValues = Omit<ProductService, 'id' | 'product_id' | 'created_at' | 'updated_at'>;

export type PropertyTemplate = {
  id: string;
  name: string;
  description?: string;
  data_type: PropertyDataType;
  unit?: string;
  is_required: boolean;
  default_value?: any;
  validation_rules?: PropertyValidationRules;
  category?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
};
