import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IoTAgentMeshRequest {
  endpoint: string
  method: string
  data?: any
  agentId?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get auth header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Get user's organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()

    if (!orgMember) {
      return new Response(
        JSON.stringify({ error: 'User not associated with any organization' }),
        { status: 403, headers: corsHeaders }
      )
    }

    // Parse request body
    const { endpoint, method, data, agentId }: IoTAgentMeshRequest = await req.json()

    // Get IoT Agent Mesh API configuration from secrets
    const iotAgentMeshUrl = Deno.env.get('IOT_AGENT_MESH_URL') || 'https://api.iotagentmesh.com/v1'
    const iotAgentMeshApiKey = Deno.env.get('IOT_AGENT_MESH_API_KEY')

    if (!iotAgentMeshApiKey) {
      return new Response(
        JSON.stringify({ error: 'IoT Agent Mesh API key not configured' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Build request headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${iotAgentMeshApiKey}`,
      'X-Organization-ID': orgMember.organization_id,
    }

    if (agentId) {
      requestHeaders['X-Agent-ID'] = agentId
    }

    // Make request to IoT Agent Mesh API
    const response = await fetch(`${iotAgentMeshUrl}${endpoint}`, {
      method: method.toUpperCase(),
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    })

    const responseData = await response.json()

    // Log API usage
    EdgeRuntime.waitUntil(
      logApiUsage(supabase, {
        organizationId: orgMember.organization_id,
        userId: user.id,
        endpoint,
        method,
        statusCode: response.status,
        responseTime: Date.now(),
      })
    )

    return new Response(
      JSON.stringify(responseData),
      {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('IoT Agent Mesh Proxy Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})

async function logApiUsage(supabase: any, usage: {
  organizationId: string
  userId: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
}) {
  try {
    await supabase
      .from('api_usage')
      .insert({
        organization_id: usage.organizationId,
        endpoint: usage.endpoint,
        method: usage.method,
        status_code: usage.statusCode,
        response_time_ms: Date.now() - usage.responseTime,
        created_at: new Date().toISOString(),
      })
  } catch (error) {
    console.error('Failed to log API usage:', error)
  }
}