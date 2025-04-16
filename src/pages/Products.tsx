
import React, { useEffect } from 'react';
import { ProductList } from '@/components/products/ProductList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Products() {
  // On component mount, check if create_product function exists and create it if not
  useEffect(() => {
    const setupProductFunction = async () => {
      // Check if function exists
      const { data: functionExists, error: checkError } = await supabase
        .rpc('function_exists', { function_name: 'create_product' });
      
      if (checkError) {
        console.error('Error checking for function:', checkError);
        return;
      }
      
      // If function doesn't exist, create it
      if (!functionExists) {
        const createFunctionQuery = `
          CREATE OR REPLACE FUNCTION public.create_product(
            name text,
            description text,
            version text,
            category text,
            tags text,
            status text,
            organization_id uuid
          )
          RETURNS json
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            new_product json;
          BEGIN
            INSERT INTO public.product_templates (
              name, description, version, category, tags, status, organization_id
            ) VALUES (
              name, description, version, category, tags, status, organization_id
            )
            RETURNING to_json(product_templates.*) INTO new_product;
            
            RETURN new_product;
          END;
          $$;
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createFunctionQuery });
        if (createError) {
          console.error('Error creating function:', createError);
          toast.error('Failed to setup database function');
        } else {
          console.log('Product creation function set up successfully');
        }
      }
    };
    
    setupProductFunction();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <ProductList />
    </div>
  );
}
