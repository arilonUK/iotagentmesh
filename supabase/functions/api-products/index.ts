
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProductData {
  name: string;
  description?: string;
  version?: string;
  category?: string;
  tags?: string;
  status?: string;
}

interface PropertyData {
  name: string;
  description?: string;
  data_type: string;
  unit?: string;
  is_required?: boolean;
  default_value?: any;
  validation_rules?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Authenticate API key first
    const authResult = await supabaseClient.functions.invoke('api-auth', {
      headers: {
        Authorization: req.headers.get('Authorization') || ''
      }
    });

    if (authResult.error || !authResult.data?.success) {
      return new Response(
        JSON.stringify({ error: authResult.data?.error || 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { api_key_id, organization_id, scopes } = authResult.data;

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    const productId = pathParts[2]; // /api/products/{id}
    const subResource = pathParts[3]; // properties
    const subResourceId = pathParts[4]; // property id

    // GET /api/products - List products
    if (req.method === 'GET' && !productId) {
      if (!scopes.includes('read') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for product read operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: products, error } = await supabaseClient
        .rpc('get_org_products', { p_org_id: organization_id });

      if (error) {
        console.error('Error fetching products:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch products' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ products }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /api/products/{id} - Get specific product
    if (req.method === 'GET' && productId && !subResource) {
      if (!scopes.includes('read') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for product read operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: product, error } = await supabaseClient
        .rpc('get_product_by_id', { p_id: productId });

      if (error || !product || product.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Product not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if product belongs to organization
      if (product[0].organization_id !== organization_id) {
        return new Response(
          JSON.stringify({ error: 'Product not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ product: product[0] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /api/products - Create product
    if (req.method === 'POST' && !productId) {
      if (!scopes.includes('write') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for product write operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const productData: ProductData = await req.json();

      if (!productData.name) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: product, error } = await supabaseClient
        .rpc('create_product_bypass_rls', {
          p_name: productData.name,
          p_description: productData.description || '',
          p_version: productData.version || '1.0',
          p_category: productData.category || '',
          p_tags: productData.tags || '',
          p_status: productData.status || 'draft',
          p_organization_id: organization_id
        });

      if (error) {
        console.error('Error creating product:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create product' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ product }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /api/products/{id} - Update product
    if (req.method === 'PUT' && productId && !subResource) {
      if (!scopes.includes('write') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for product write operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData: Partial<ProductData> = await req.json();

      const { data: product, error } = await supabaseClient
        .rpc('update_product_bypass_rls', {
          p_id: productId,
          p_data: JSON.stringify(updateData)
        });

      if (error) {
        console.error('Error updating product:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update product' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ product }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /api/products/{id} - Delete product
    if (req.method === 'DELETE' && productId && !subResource) {
      if (!scopes.includes('write') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for product write operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabaseClient
        .from('product_templates')
        .delete()
        .eq('id', productId)
        .eq('organization_id', organization_id);

      if (error) {
        console.error('Error deleting product:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete product' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Product deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /api/products/{id}/properties - Get product properties
    if (req.method === 'GET' && productId && subResource === 'properties' && !subResourceId) {
      if (!scopes.includes('read') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for property read operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: properties, error } = await supabaseClient
        .rpc('get_product_properties', { p_product_id: productId });

      if (error) {
        console.error('Error fetching properties:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch properties' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ properties }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /api/products/{id}/properties - Create property
    if (req.method === 'POST' && productId && subResource === 'properties' && !subResourceId) {
      if (!scopes.includes('write') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for property write operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const propertyData: PropertyData = await req.json();

      if (!propertyData.name || !propertyData.data_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: name and data_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: property, error } = await supabaseClient
        .rpc('create_property_bypass_rls', {
          p_product_id: productId,
          p_name: propertyData.name,
          p_description: propertyData.description || '',
          p_data_type: propertyData.data_type,
          p_unit: propertyData.unit || null,
          p_is_required: propertyData.is_required || false,
          p_default_value: propertyData.default_value || null,
          p_validation_rules: propertyData.validation_rules || null
        });

      if (error) {
        console.error('Error creating property:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create property' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ property }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /api/products/{id}/properties/{propertyId} - Update property
    if (req.method === 'PUT' && productId && subResource === 'properties' && subResourceId) {
      if (!scopes.includes('write') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for property write operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData: Partial<PropertyData> = await req.json();

      const { data: property, error } = await supabaseClient
        .rpc('update_property_bypass_rls', {
          p_id: subResourceId,
          p_data: JSON.stringify(updateData)
        });

      if (error) {
        console.error('Error updating property:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update property' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ property }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /api/products/{id}/properties/{propertyId} - Delete property
    if (req.method === 'DELETE' && productId && subResource === 'properties' && subResourceId) {
      if (!scopes.includes('write') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for property write operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabaseClient
        .rpc('delete_property_bypass_rls', { p_id: subResourceId });

      if (error) {
        console.error('Error deleting property:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete property' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Property deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method or endpoint not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in api-products function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
