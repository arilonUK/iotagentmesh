
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    console.log(`Endpoints API: ${method} ${path}`)

    // Parse organization ID from auth or headers
    const authHeader = req.headers.get('Authorization')
    let organizationId = null

    if (authHeader?.startsWith('Bearer iot_')) {
      // API key authentication - get org from API key
      const response = await supabaseClient.functions.invoke('api-auth', {
        headers: { Authorization: authHeader }
      })
      if (response.data?.success) {
        organizationId = response.data.organization_id
      }
    } else {
      // JWT authentication - get org from user profile
      const { data: { user } } = await supabaseClient.auth.getUser(authHeader?.replace('Bearer ', '') || '')
      if (user) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('default_organization_id')
          .eq('id', user.id)
          .single()
        organizationId = profile?.default_organization_id
      }
    }

    if (!organizationId) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/endpoints' && method === 'GET') {
      const { data, error } = await supabaseClient
        .from('endpoints')
        .select('*')
        .eq('organization_id', organizationId)

      if (error) throw error

      return new Response(JSON.stringify({ endpoints: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/endpoints' && method === 'POST') {
      const body = await req.json()
      const { data, error } = await supabaseClient
        .from('endpoints')
        .insert({
          ...body,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ endpoint: data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const endpointIdMatch = path.match(/^\/api\/endpoints\/([^\/]+)$/)
    if (endpointIdMatch) {
      const endpointId = endpointIdMatch[1]

      if (method === 'PUT') {
        const body = await req.json()
        const { data, error } = await supabaseClient
          .from('endpoints')
          .update({
            ...body,
            updated_at: new Date().toISOString()
          })
          .eq('id', endpointId)
          .eq('organization_id', organizationId)
          .select()
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ endpoint: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'DELETE') {
        const { error } = await supabaseClient
          .from('endpoints')
          .delete()
          .eq('id', endpointId)
          .eq('organization_id', organizationId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    if (path.startsWith('/api/endpoints/') && path.endsWith('/trigger') && method === 'POST') {
      const endpointId = path.split('/')[3]
      const body = await req.json()

      // Get endpoint configuration
      const { data: endpoint, error: endpointError } = await supabaseClient
        .from('endpoints')
        .select('*')
        .eq('id', endpointId)
        .eq('organization_id', organizationId)
        .single()

      if (endpointError) throw endpointError

      // Log execution
      await supabaseClient
        .from('endpoint_executions')
        .insert({
          endpoint_id: endpointId,
          success: true,
          payload: body,
          executed_at: new Date().toISOString()
        })

      return new Response(JSON.stringify({ success: true, message: 'Endpoint triggered' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in api-endpoints:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
