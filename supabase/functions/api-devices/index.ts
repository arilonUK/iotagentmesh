
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeviceData {
  name: string;
  type: string;
  status?: string;
  description?: string;
  product_template_id?: string;
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

    // Check if user has device permissions
    if (!scopes.includes('devices') && !scopes.includes('write')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions for device operations' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    const deviceId = pathParts[2]; // /api/devices/{id}

    // GET /api/devices - List devices
    if (req.method === 'GET' && !deviceId) {
      const { data: devices, error } = await supabaseClient
        .rpc('get_devices_by_org_id', { p_organization_id: organization_id });

      if (error) {
        console.error('Error fetching devices:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch devices' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Track usage
      await supabaseClient.functions.invoke('usage-tracker', {
        body: {
          api_key_id,
          organization_id,
          endpoint: '/api/devices',
          method: 'GET',
          status_code: 200,
          response_time_ms: 0,
          ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For'),
          user_agent: req.headers.get('User-Agent')
        }
      });

      return new Response(
        JSON.stringify({ devices }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /api/devices/{id} - Get specific device
    if (req.method === 'GET' && deviceId) {
      const { data: device, error } = await supabaseClient
        .rpc('get_device_by_id_bypass_rls', { p_device_id: deviceId });

      if (error) {
        console.error('Error fetching device:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch device' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!device || device.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Device not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if device belongs to the organization
      if (device[0].organization_id !== organization_id) {
        return new Response(
          JSON.stringify({ error: 'Device not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ device: device[0] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /api/devices - Create device
    if (req.method === 'POST' && !deviceId) {
      const deviceData: DeviceData = await req.json();

      if (!deviceData.name || !deviceData.type) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: name and type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: device, error } = await supabaseClient
        .rpc('create_device_bypass_rls', {
          p_name: deviceData.name,
          p_type: deviceData.type,
          p_status: deviceData.status || 'offline',
          p_description: deviceData.description || null,
          p_organization_id: organization_id,
          p_product_template_id: deviceData.product_template_id || null
        });

      if (error) {
        console.error('Error creating device:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create device' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ device }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /api/devices/{id} - Update device
    if (req.method === 'PUT' && deviceId) {
      const updateData: Partial<DeviceData> = await req.json();

      const { data: device, error } = await supabaseClient
        .rpc('update_device_bypass_rls', {
          p_device_id: deviceId,
          p_data: JSON.stringify(updateData)
        });

      if (error) {
        console.error('Error updating device:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update device' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ device }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /api/devices/{id} - Delete device
    if (req.method === 'DELETE' && deviceId) {
      const { error } = await supabaseClient
        .rpc('delete_device_bypass_rls', { p_device_id: deviceId });

      if (error) {
        console.error('Error deleting device:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete device' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Device deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in api-devices function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
