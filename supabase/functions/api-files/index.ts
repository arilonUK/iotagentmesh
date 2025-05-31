
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

    console.log(`Files API: ${method} ${path}`)

    // Get user and organization
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

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('default_organization_id')
      .eq('id', user.id)
      .single()

    const organizationId = profile?.default_organization_id

    if (!organizationId) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/files/profiles' && method === 'GET') {
      const { data, error } = await supabaseClient
        .from('file_storage_profiles')
        .select('*')
        .eq('organization_id', organizationId)

      if (error) throw error

      return new Response(JSON.stringify({ profiles: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path === '/api/files/profiles' && method === 'POST') {
      const body = await req.json()
      const { data, error } = await supabaseClient
        .from('file_storage_profiles')
        .insert({
          ...body,
          organization_id: organizationId
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ profile: data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const profileIdMatch = path.match(/^\/api\/files\/profiles\/([^\/]+)$/)
    if (profileIdMatch && method === 'GET') {
      const profileId = profileIdMatch[1]
      const { data, error } = await supabaseClient
        .from('file_storage_profiles')
        .select('*')
        .eq('id', profileId)
        .eq('organization_id', organizationId)
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (path.startsWith('/api/files/list')) {
      const searchParams = url.searchParams
      const filePath = searchParams.get('path') || ''
      const fullPath = `${organizationId}/${filePath}`.replace(/\/+$/, '')

      const { data, error } = await supabaseClient
        .storage
        .from('device_files')
        .list(fullPath, {
          sortBy: { column: 'name', order: 'asc' }
        })

      if (error) throw error

      const files = data.map(item => ({
        id: item.id,
        name: item.name,
        size: item.metadata?.size || 0,
        mimetype: item.metadata?.mimetype || '',
        created_at: item.created_at,
        updated_at: item.created_at,
        path: `${fullPath}/${item.name}`
      }))

      return new Response(JSON.stringify({ files }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in api-files:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
