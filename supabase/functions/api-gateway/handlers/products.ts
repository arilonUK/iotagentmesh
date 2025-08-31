
import { corsHeaders } from '../../_shared/cors.ts';
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { Database } from '../../_shared/database.types.ts';

export async function handleProducts(req: Request, path: string): Promise<Response> {
  const supabaseClient: SupabaseClient<Database> = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const segments = path.replace('/api/products', '').split('/').filter(Boolean);
    const method = req.method;

    // Get auth header and verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's organization
    const { data: orgMember, error: orgError } = await supabaseClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (orgError || !orgMember) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not associated with any organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const organizationId = orgMember.organization_id;

    // Route handling
    if (method === 'GET' && segments.length === 0) {
      // GET /api/products - List products
      const { data: products, error } = await supabaseClient
        .from('product_templates')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch products' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, products: products }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'POST' && segments.length === 0) {
      // POST /api/products - Create new product
      const requestData: Record<string, unknown> = await req.json();
      
      // Validate request data
      if (!requestData.name || !requestData.version) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields: name and version' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert product into database
      const { data: product, error: insertError } = await supabaseClient
        .from('product_templates')
        .insert({
          organization_id: organizationId,
          name: requestData.name,
          description: requestData.description || null,
          version: requestData.version,
          category: requestData.category || null,
          tags: requestData.tags || null,
          status: requestData.status || 'draft',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting product:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create product' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, product: product }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'GET' && segments.length === 1) {
      // GET /api/products/:id - Get specific product
      const productId = segments[0];

      const { data: product, error } = await supabaseClient
        .from('product_templates')
        .select('*')
        .eq('id', productId)
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Product not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, product: product }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'PUT' && segments.length === 1) {
      // PUT /api/products/:id - Update product
      const productId = segments[0];
      const updates: Record<string, unknown> = await req.json();

      const { data: updatedProduct, error } = await supabaseClient
        .from('product_templates')
        .update(updates)
        .eq('id', productId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update product' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, product: updatedProduct }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'DELETE' && segments.length === 1) {
      // DELETE /api/products/:id - Delete product
      const productId = segments[0];

      const { error } = await supabaseClient
        .from('product_templates')
        .delete()
        .eq('id', productId)
        .eq('organization_id', organizationId);

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to delete product' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in products handler:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
