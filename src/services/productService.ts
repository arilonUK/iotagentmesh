
import { supabase } from '@/integrations/supabase/client';
import { ProductTemplate, ProductProperty } from '@/types/product';

export const productServices = {
  async fetchProducts(organizationId: string): Promise<ProductTemplate[]> {
    const { data, error } = await supabase
      .from('product_templates')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data || [];
  },

  async createProduct(product: Omit<ProductTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ProductTemplate> {
    const { data, error } = await supabase
      .from('product_templates')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data;
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

    return data || [];
  }
};
