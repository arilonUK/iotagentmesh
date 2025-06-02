
import { corsHeaders } from '../../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleEndpoints(req: Request, path: string): Promise<Response> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const segments = path.replace('/api/endpoints', '').split('/').filter(Boolean);
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
      // GET /api/endpoints - List endpoints
      const { data: endpoints, error } = await supabaseClient
        .from('endpoints')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch endpoints' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, endpoints: endpoints }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'POST' && segments.length === 0) {
      // POST /api/endpoints - Create new endpoint
      const requestData = await req.json();
      
      // Validate request data
      if (!requestData.name || !requestData.type) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields: name and type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert endpoint into database
      const { data: endpoint, error: insertError } = await supabaseClient
        .from('endpoints')
        .insert({
          organization_id: organizationId,
          name: requestData.name,
          type: requestData.type,
          description: requestData.description || null,
          configuration: requestData.configuration || {},
          enabled: requestData.enabled || true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting endpoint:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create endpoint' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, endpoint: endpoint }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'GET' && segments.length === 1) {
      // GET /api/endpoints/:id - Get specific endpoint
      const endpointId = segments[0];

      const { data: endpoint, error } = await supabaseClient
        .from('endpoints')
        .select('*')
        .eq('id', endpointId)
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Endpoint not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, endpoint: endpoint }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'PUT' && segments.length === 1) {
      // PUT /api/endpoints/:id - Update endpoint
      const endpointId = segments[0];
      const updates = await req.json();

      const { data: updatedEndpoint, error } = await supabaseClient
        .from('endpoints')
        .update(updates)
        .eq('id', endpointId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update endpoint' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, endpoint: updatedEndpoint }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'DELETE' && segments.length === 1) {
      // DELETE /api/endpoints/:id - Delete endpoint
      const endpointId = segments[0];

      const { error } = await supabaseClient
        .from('endpoints')
        .delete()
        .eq('id', endpointId)
        .eq('organization_id', organizationId);

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to delete endpoint' }),
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
    console.error('Error in endpoints handler:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
