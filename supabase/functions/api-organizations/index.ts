
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

    console.log(`Organizations API: ${method} ${path}`)

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

    if (path === '/api/organizations' && method === 'GET') {
      const { data, error } = await supabaseClient.rpc('get_user_organizations', {
        p_user_id: user.id
      })

      if (error) throw error

      return new Response(JSON.stringify({ organizations: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const orgIdMatch = path.match(/^\/api\/organizations\/([^\/]+)$/)
    if (orgIdMatch && method === 'GET') {
      const orgId = orgIdMatch[1]
      const { data, error } = await supabaseClient.rpc('get_organization_with_role', {
        p_org_id: orgId,
        p_user_id: user.id
      })

      if (error) throw error

      return new Response(JSON.stringify({ organization: data[0] || null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path.endsWith('/members') && method === 'GET') {
      const orgId = path.split('/')[3]
      const { data, error } = await supabaseClient.rpc('get_organization_members', {
        p_org_id: orgId
      })

      if (error) throw error

      return new Response(JSON.stringify({ members: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in api-organizations:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
