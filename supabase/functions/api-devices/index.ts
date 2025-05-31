
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

    const authHeader = req.headers.get('Authorization') || '';
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing');

    let organization_id: string;
    let user_id: string | null = null;

    // Check if this is a JWT token (user session) or API key
    if (authHeader.startsWith('Bearer ey')) {
      // This looks like a JWT token - validate with Supabase auth
      console.log('Processing JWT token authentication');
      
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (authError || !user) {
        console.error('JWT authentication failed:', authError);
        return new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      user_id = user.id;
      console.log('User authenticated:', user_id);

      // Get user's default organization
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('default_organization_id')
        .eq('id', user_id)
        .single();

      if (profileError || !profile?.default_organization_id) {
        console.error('Failed to get user organization:', profileError);
        return new Response(
          JSON.stringify({ error: 'No organization found for user' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      organization_id = profile.default_organization_id;
      console.log('Using organization:', organization_id);

    } else {
      // Try API key authentication
      console.log('Processing API key authentication');
      
      const authResult = await supabaseClient.functions.invoke('api-auth', {
        headers: {
          Authorization: authHeader
        }
      });

      if (authResult.error || !authResult.data?.success) {
        console.error('API key authentication failed:', authResult.error);
        return new Response(
          JSON.stringify({ error: authResult.data?.error || 'Authentication failed' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      organization_id = authResult.data.organization_id;
      console.log('API key authenticated for organization:', organization_id);

      // Check if user has device permissions
      const scopes = authResult.data.scopes || [];
      if (!scopes.includes('devices') && !scopes.includes('read') && !scopes.includes('write')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for device operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const url = new URL(req.url);
    let pathname = url.pathname;
    console.log('Request path:', pathname);
    console.log('Method:', req.method);

    // Remove the /api-devices prefix if present (from edge function routing)
    if (pathname.startsWith('/api-devices')) {
      pathname = pathname.replace('/api-devices', '') || '/';
    }
    
    // Parse the path to determine the operation
    const pathParts = pathname.split('/').filter(part => part);
    const deviceId = pathParts.length > 0 ? pathParts[0] : null;
    
    console.log('Parsed path parts:', pathParts);
    console.log('Device ID from path:', deviceId);

    // GET /api/devices - List devices (when no path parts or empty path)
    if (req.method === 'GET' && (!deviceId || pathname === '/')) {
      console.log('Fetching devices for organization:', organization_id);
      
      const { data: devices, error } = await supabaseClient
        .rpc('get_devices_by_org_id', { p_organization_id: organization_id });

      if (error) {
        console.error('Error fetching devices:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch devices' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Found ${devices?.length || 0} devices`);

      return new Response(
        JSON.stringify({ devices: devices || [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /api/devices/{id} - Get specific device
    if (req.method === 'GET' && deviceId) {
      console.log('Fetching specific device:', deviceId);
      
      // Validate that deviceId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(deviceId)) {
        console.error('Invalid device ID format:', deviceId);
        return new Response(
          JSON.stringify({ error: 'Invalid device ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
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
    if (req.method === 'POST') {
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
