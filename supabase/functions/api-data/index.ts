
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReadingData {
  reading_type: string;
  value: number;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

interface DataBucketData {
  data: Array<Record<string, unknown>>;
  timestamp?: string;
  metadata?: Record<string, unknown>;
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
    
    // Parse different endpoint patterns
    let endpoint = '';
    let resourceId = '';
    
    if (pathParts.includes('data-buckets')) {
      endpoint = 'data-buckets';
      resourceId = pathParts[pathParts.indexOf('data-buckets') + 1];
    } else if (pathParts.includes('devices')) {
      endpoint = 'devices';
      resourceId = pathParts[pathParts.indexOf('devices') + 1];
    }

    // POST /api/data-buckets/{id}/data - Send data to bucket
    if (req.method === 'POST' && endpoint === 'data-buckets' && pathParts.includes('data')) {
      if (!scopes.includes('write') && !scopes.includes('basic_write')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for data write operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const bucketData: DataBucketData = await req.json();

      // Verify bucket belongs to organization
      const { data: bucket, error: bucketError } = await supabaseClient
        .from('data_buckets')
        .select('*')
        .eq('id', resourceId)
        .eq('organization_id', organization_id)
        .single();

      if (bucketError || !bucket) {
        return new Response(
          JSON.stringify({ error: 'Data bucket not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Store data - this would typically go to the configured storage backend
      // For now, we'll store it as a basic record
      const { error: insertError } = await supabaseClient
        .from('device_readings')
        .insert({
          device_id: bucket.device_id,
          organization_id: organization_id,
          reading_type: bucket.reading_type,
          value: Array.isArray(bucketData.data) ? bucketData.data.length : 1,
          timestamp: bucketData.timestamp || new Date().toISOString(),
          metadata: { bucket_data: bucketData.data, ...bucketData.metadata }
        });

      if (insertError) {
        console.error('Error storing bucket data:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to store data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Data stored successfully' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /api/data-buckets/{id}/data - Retrieve data from bucket
    if (req.method === 'GET' && endpoint === 'data-buckets' && pathParts.includes('data')) {
      if (!scopes.includes('read') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for data read operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify bucket belongs to organization
      const { data: bucket, error: bucketError } = await supabaseClient
        .from('data_buckets')
        .select('*')
        .eq('id', resourceId)
        .eq('organization_id', organization_id)
        .single();

      if (bucketError || !bucket) {
        return new Response(
          JSON.stringify({ error: 'Data bucket not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get query parameters for filtering
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const startTime = url.searchParams.get('start_time');
      const endTime = url.searchParams.get('end_time');

      let query = supabaseClient
        .from('device_readings')
        .select('*')
        .eq('device_id', bucket.device_id)
        .eq('reading_type', bucket.reading_type)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (startTime) {
        query = query.gte('timestamp', startTime);
      }
      if (endTime) {
        query = query.lte('timestamp', endTime);
      }

      const { data: readings, error: readingsError } = await query;

      if (readingsError) {
        console.error('Error fetching bucket data:', readingsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ data: readings }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /api/devices/{id}/readings - Send device readings
    if (req.method === 'POST' && endpoint === 'devices' && pathParts.includes('readings')) {
      if (!scopes.includes('write') && !scopes.includes('basic_write')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for data write operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const readingData: ReadingData = await req.json();

      if (!readingData.reading_type || typeof readingData.value !== 'number') {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: reading_type and value' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify device belongs to organization
      const { data: device, error: deviceError } = await supabaseClient
        .rpc('get_device_by_id_bypass_rls', { p_device_id: resourceId });

      if (deviceError || !device || device.length === 0 || device[0].organization_id !== organization_id) {
        return new Response(
          JSON.stringify({ error: 'Device not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Insert reading
      const { error: insertError } = await supabaseClient
        .from('device_readings')
        .insert({
          device_id: resourceId,
          organization_id: organization_id,
          reading_type: readingData.reading_type,
          value: readingData.value,
          timestamp: readingData.timestamp || new Date().toISOString(),
          metadata: readingData.metadata
        });

      if (insertError) {
        console.error('Error storing reading:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to store reading' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update device last_active_at
      await supabaseClient
        .rpc('update_device_bypass_rls', {
          p_device_id: resourceId,
          p_data: JSON.stringify({ last_active_at: new Date().toISOString() })
        });

      return new Response(
        JSON.stringify({ message: 'Reading stored successfully' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /api/devices/{id}/readings - Get device readings
    if (req.method === 'GET' && endpoint === 'devices' && pathParts.includes('readings')) {
      if (!scopes.includes('read') && !scopes.includes('devices')) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions for data read operations' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify device belongs to organization
      const { data: device, error: deviceError } = await supabaseClient
        .rpc('get_device_by_id_bypass_rls', { p_device_id: resourceId });

      if (deviceError || !device || device.length === 0 || device[0].organization_id !== organization_id) {
        return new Response(
          JSON.stringify({ error: 'Device not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get query parameters
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const readingType = url.searchParams.get('reading_type');
      const startTime = url.searchParams.get('start_time');
      const endTime = url.searchParams.get('end_time');

      let query = supabaseClient
        .from('device_readings')
        .select('*')
        .eq('device_id', resourceId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (readingType) {
        query = query.eq('reading_type', readingType);
      }
      if (startTime) {
        query = query.gte('timestamp', startTime);
      }
      if (endTime) {
        query = query.lte('timestamp', endTime);
      }

      const { data: readings, error: readingsError } = await query;

      if (readingsError) {
        console.error('Error fetching readings:', readingsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch readings' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ readings }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method or endpoint not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in api-data function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
