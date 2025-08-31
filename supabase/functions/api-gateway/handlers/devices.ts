
import { corsHeaders } from '../../_shared/cors.ts';
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { Database } from '../../_shared/database.types.ts';

export async function handleDevices(req: Request, path: string): Promise<Response> {
  const supabaseClient: SupabaseClient<Database> = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const segments = path.replace('/api/devices', '').split('/').filter(Boolean);
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
      // GET /api/devices - List devices
      const { data: devices, error } = await supabaseClient
        .from('devices')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch devices' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, devices: devices }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'POST' && segments.length === 0) {
      // POST /api/devices - Create new device
      const requestData: Record<string, unknown> = await req.json();
      
      // Validate request data
      if (!requestData.name || !requestData.type) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields: name and type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert device into database
      const { data: device, error: insertError } = await supabaseClient
        .from('devices')
        .insert({
          organization_id: organizationId,
          name: requestData.name,
          type: requestData.type,
          description: requestData.description || null,
          status: requestData.status || 'offline',
          product_template_id: requestData.product_template_id || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting device:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create device' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, device: device }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'GET' && segments.length === 1) {
      // GET /api/devices/:id - Get specific device
      const deviceId = segments[0];

      const { data: device, error } = await supabaseClient
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Device not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, device: device }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'PUT' && segments.length === 1) {
      // PUT /api/devices/:id - Update device
      const deviceId = segments[0];
      const updates: Record<string, unknown> = await req.json();

      const { data: updatedDevice, error } = await supabaseClient
        .from('devices')
        .update(updates)
        .eq('id', deviceId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update device' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, device: updatedDevice }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'DELETE' && segments.length === 1) {
      // DELETE /api/devices/:id - Delete device
      const deviceId = segments[0];

      const { error } = await supabaseClient
        .from('devices')
        .delete()
        .eq('id', deviceId)
        .eq('organization_id', organizationId);

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to delete device' }),
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
    console.error('Error in devices handler:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
