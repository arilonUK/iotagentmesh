import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate, ProductProperty } from '@/types/product';

export const productServices = {
  async fetchProducts(organizationId: string): Promise<ProductTemplate[]> {
    try {
      // Use a direct query without relying on RLS policies for organization_members
      const { data, error } = await supabase
        .from('product_templates')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      // Cast the data to ensure it conforms to ProductTemplate type
      return (data || []).map(item => ({
        ...item,
        status: (item.status || 'draft') as 'draft' | 'active' | 'archived'
      }));
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      // Return empty array instead of throwing to avoid breaking the UI
      return [];
    }
  },

  async fetchProduct(id: string): Promise<ProductTemplate> {
    const { data, error } = await supabase
      .from('product_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    // Cast the data to ensure it conforms to ProductTemplate type
    return {
      ...data,
      status: (data.status || 'draft') as 'draft' | 'active' | 'archived'
    };
  },

  async createProduct(product: Omit<ProductTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ProductTemplate> {
    try {
      console.log('Creating product with data:', product);
      
      const { data, error } = await supabase
        .from('product_templates')
        .insert(product)
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      console.log('Product created successfully:', data);
      return {
        ...data,
        status: (data.status || 'draft') as 'draft' | 'active' | 'archived'
      };
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  },

  async fetchProductProperties(productId: string): Promise<ProductProperty[]> {
    const { data, error } = await supabase
      .from('product_properties')
      .select('*')
      .eq('product_id', productId);

    if (error) {
      console.error('Error fetching product properties:', error);
      throw error;
    }

    // Map the data to ensure properties conform to the expected types
    return (data || []).map(property => ({
      ...property,
      data_type: property.data_type as 'string' | 'number' | 'boolean' | 'location',
      validation_rules: property.validation_rules as { 
        min?: number; 
        max?: number; 
        pattern?: string; 
        options?: string[] 
      } | undefined
    }));
  },

  async createProductProperty(property: Omit<ProductProperty, 'id' | 'created_at' | 'updated_at'>): Promise<ProductProperty> {
    const { data, error } = await supabase
      .from('product_properties')
      .insert(property)
      .select()
      .single();

    if (error) {
      console.error('Error creating product property:', error);
      throw error;
    }

    return {
      ...data,
      data_type: data.data_type as 'string' | 'number' | 'boolean' | 'location',
      validation_rules: data.validation_rules as {
        min?: number;
        max?: number;
        pattern?: string;
        options?: string[];
      } | undefined
    };
  },

  async updateProductProperty(id: string, data: Partial<ProductProperty>): Promise<ProductProperty> {
    const { data: updatedProperty, error } = await supabase
      .from('product_properties')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product property:', error);
      throw error;
    }

    return {
      ...updatedProperty,
      data_type: updatedProperty.data_type as 'string' | 'number' | 'boolean' | 'location',
      validation_rules: updatedProperty.validation_rules as {
        min?: number;
        max?: number;
        pattern?: string;
        options?: string[];
      } | undefined
    };
  },

  async deleteProductProperty(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product property:', error);
      throw error;
    }
  },

  async updateProduct(id: string, data: Partial<ProductTemplate>): Promise<ProductTemplate> {
    const { data: updatedProduct, error } = await supabase
      .from('product_templates')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return {
      ...updatedProduct,
      status: (updatedProduct.status || 'draft') as 'draft' | 'active' | 'archived'
    };
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};
