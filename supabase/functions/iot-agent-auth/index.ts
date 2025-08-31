import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import type { Database } from '../_shared/database.types.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthRequest {
  action: 'register_agent' | 'authenticate_agent' | 'revoke_agent'
  agent_id?: string
  agent_name?: string
  agent_type?: string
  capabilities?: string[]
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
    const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseKey)

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

    // Check user permissions (admin or owner required)
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()

    if (!orgMember || !['admin', 'owner'].includes(orgMember.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: corsHeaders }
      )
    }

    const { action, agent_id, agent_name, agent_type, capabilities }: AuthRequest = await req.json()

    switch (action) {
      case 'register_agent':
        return await registerAgent(supabase, orgMember.organization_id, {
          agent_name,
          agent_type,
          capabilities
        })

      case 'authenticate_agent':
        return await authenticateAgent(supabase, orgMember.organization_id, agent_id!)

      case 'revoke_agent':
        return await revokeAgent(supabase, orgMember.organization_id, agent_id!)

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        )
    }

  } catch (error) {
    console.error('Agent auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})

async function registerAgent(supabase: SupabaseClient<Database>, organizationId: string, agentData: {
  agent_name?: string
  agent_type?: string
  capabilities?: string[]
}) {
  try {
    // Get IoT Agent Mesh API configuration
    const iotAgentMeshUrl = Deno.env.get('IOT_AGENT_MESH_URL') || 'https://api.iotagentmesh.com/v1'
    const iotAgentMeshApiKey = Deno.env.get('IOT_AGENT_MESH_API_KEY')

    if (!iotAgentMeshApiKey) {
      return new Response(
        JSON.stringify({ error: 'IoT Agent Mesh API key not configured' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Register agent with IoT Agent Mesh
    const response = await fetch(`${iotAgentMeshUrl}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${iotAgentMeshApiKey}`,
        'X-Organization-ID': organizationId,
      },
      body: JSON.stringify({
        name: agentData.agent_name,
        type: agentData.agent_type,
        capabilities: agentData.capabilities,
        organization_id: organizationId,
      }),
    })

    const agentInfo = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to register agent', details: agentInfo }),
        { status: response.status, headers: corsHeaders }
      )
    }

    // Store agent credentials securely
    const agentCredentials = {
      agent_id: agentInfo.id,
      agent_token: agentInfo.token,
      organization_id: organizationId,
      registered_at: new Date().toISOString(),
      status: 'active'
    }

    // Log the registration
    EdgeRuntime.waitUntil(
      supabase
        .from('api_usage')
        .insert({
          organization_id: organizationId,
          endpoint: '/auth/register-agent',
          method: 'POST',
          status_code: 200,
          metadata: {
            agent_id: agentInfo.id,
            agent_name: agentData.agent_name
          }
        })
    )

    return new Response(
      JSON.stringify({
        success: true,
        agent: {
          id: agentInfo.id,
          name: agentInfo.name,
          type: agentInfo.type,
          status: agentInfo.status
        },
        credentials: agentCredentials
      }),
      { status: 201, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Agent registration error:', error)
    return new Response(
      JSON.stringify({ error: 'Registration failed' }),
      { status: 500, headers: corsHeaders }
    )
  }
}

async function authenticateAgent(supabase: SupabaseClient<Database>, organizationId: string, agentId: string) {
  try {
    // Get IoT Agent Mesh API configuration
    const iotAgentMeshUrl = Deno.env.get('IOT_AGENT_MESH_URL') || 'https://api.iotagentmesh.com/v1'
    const iotAgentMeshApiKey = Deno.env.get('IOT_AGENT_MESH_API_KEY')

    if (!iotAgentMeshApiKey) {
      return new Response(
        JSON.stringify({ error: 'IoT Agent Mesh API key not configured' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Verify agent with IoT Agent Mesh
    const response = await fetch(`${iotAgentMeshUrl}/agents/${agentId}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${iotAgentMeshApiKey}`,
        'X-Organization-ID': organizationId,
      },
    })

    const authResult = await response.json()

    return new Response(
      JSON.stringify(authResult),
      { status: response.status, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Agent authentication error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500, headers: corsHeaders }
    )
  }
}

async function revokeAgent(supabase: SupabaseClient<Database>, organizationId: string, agentId: string) {
  try {
    // Get IoT Agent Mesh API configuration
    const iotAgentMeshUrl = Deno.env.get('IOT_AGENT_MESH_URL') || 'https://api.iotagentmesh.com/v1'
    const iotAgentMeshApiKey = Deno.env.get('IOT_AGENT_MESH_API_KEY')

    if (!iotAgentMeshApiKey) {
      return new Response(
        JSON.stringify({ error: 'IoT Agent Mesh API key not configured' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Revoke agent with IoT Agent Mesh
    const response = await fetch(`${iotAgentMeshUrl}/agents/${agentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${iotAgentMeshApiKey}`,
        'X-Organization-ID': organizationId,
      },
    })

    if (response.ok) {
      // Log the revocation
      EdgeRuntime.waitUntil(
        supabase
          .from('api_usage')
          .insert({
            organization_id: organizationId,
            endpoint: '/auth/revoke-agent',
            method: 'DELETE',
            status_code: 200,
            metadata: {
              agent_id: agentId,
              action: 'revoked'
            }
          })
      )
    }

    return new Response(
      JSON.stringify({ success: response.ok }),
      { status: response.status, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Agent revocation error:', error)
    return new Response(
      JSON.stringify({ error: 'Revocation failed' }),
      { status: 500, headers: corsHeaders }
    )
  }
}