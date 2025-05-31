
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

    console.log(`Profiles API: ${method} ${path}`)

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/profiles/me' && method === 'GET') {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/profiles/me' && method === 'PUT') {
      const body = await req.json()
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(body)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/profiles/organizations' && method === 'GET') {
      const { data, error } = await supabaseClient.rpc('get_user_organizations', {
        p_user_id: user.id
      })

      if (error) throw error

      return new Response(JSON.stringify({ organizations: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/profiles/switch-organization' && method === 'POST') {
      const { organizationId } = await req.json()
      const { data, error } = await supabaseClient.rpc('switch_user_organization', {
        p_user_id: user.id,
        p_org_id: organizationId
      })

      if (error) throw error

      return new Response(JSON.stringify({ success: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in api-profiles:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
