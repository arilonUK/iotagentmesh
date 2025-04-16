
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

export type ProductProperty = {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  data_type: 'number' | 'string' | 'boolean' | 'location';
  unit?: string;
  is_required: boolean;
  default_value?: any;
  validation_rules?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  created_at: string;
  updated_at: string;
};
