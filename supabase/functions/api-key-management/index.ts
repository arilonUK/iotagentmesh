
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateApiKeyRequest {
  name: string;
  scopes: string[];
  expiration?: string;
}

interface UpdateApiKeyRequest {
  name?: string;
  is_active?: boolean;
  scopes?: string[];
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's organization
    const { data: orgMember, error: orgError } = await supabaseClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()

    if (orgError || !orgMember) {
      return new Response(
        JSON.stringify({ error: 'User not associated with any organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const method = req.method
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    // Route based on method and path
    if (method === 'GET' && pathParts.length === 0) {
      // Get all API keys for organization
      return await getApiKeys(supabaseClient, orgMember.organization_id)
    } else if (method === 'POST' && pathParts.length === 0) {
      // Create new API key
      if (!['admin', 'owner'].includes(orgMember.role)) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions to create API keys' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const requestData: CreateApiKeyRequest = await req.json()
      return await createApiKey(supabaseClient, orgMember.organization_id, requestData, user.id)
    } else if (method === 'PUT' && pathParts.length === 1) {
      // Update API key
      if (!['admin', 'owner'].includes(orgMember.role)) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions to update API keys' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const keyId = pathParts[0]
      const requestData: UpdateApiKeyRequest = await req.json()
      return await updateApiKey(supabaseClient, keyId, requestData, orgMember.organization_id, user.id)
    } else if (method === 'DELETE' && pathParts.length === 1) {
      // Delete API key
      if (!['admin', 'owner'].includes(orgMember.role)) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions to delete API keys' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const keyId = pathParts[0]
      return await deleteApiKey(supabaseClient, keyId, orgMember.organization_id, user.id)
    } else if (method === 'GET' && pathParts[0] === 'usage') {
      // Get API usage
      const limit = parseInt(url.searchParams.get('limit') || '100')
      return await getApiUsage(supabaseClient, orgMember.organization_id, limit)
    } else {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in api-key-management function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getApiKeys(supabaseClient: ReturnType<typeof createClient>, organizationId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('api_keys')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return new Response(
      JSON.stringify({ api_keys: data || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch API keys' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function createApiKey(supabaseClient: ReturnType<typeof createClient>, organizationId: string, requestData: CreateApiKeyRequest, userId: string) {
  try {
    // Validate request data
    if (!requestData.name || !requestData.scopes || requestData.scopes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name and scopes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a secure API key
    const keyId = crypto.randomUUID().replace(/-/g, '')
    const fullKey = `iot_${keyId}`
    const prefix = `iot_${keyId.substring(0, 8)}...`
    
    // Hash the key for storage
    const encoder = new TextEncoder()
    const data = encoder.encode(fullKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Calculate expiration date
    let expiresAt = null
    if (requestData.expiration && requestData.expiration !== 'never') {
      const months = parseInt(requestData.expiration)
      if (!isNaN(months)) {
        const expirationDate = new Date()
        expirationDate.setMonth(expirationDate.getMonth() + months)
        expiresAt = expirationDate.toISOString()
      }
    }

    // Insert API key into database
    const { data: apiKey, error: insertError } = await supabaseClient
      .from('api_keys')
      .insert({
        organization_id: organizationId,
        name: requestData.name,
        key_hash: keyHash,
        prefix,
        scopes: requestData.scopes,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting API key:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create audit log entry
    await supabaseClient.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_action: 'api_key_created',
      p_details: { api_key_id: apiKey.id, api_key_name: requestData.name }
    })

    return new Response(
      JSON.stringify({
        api_key: apiKey,
        full_key: fullKey
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating API key:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create API key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function updateApiKey(supabaseClient: ReturnType<typeof createClient>, keyId: string, requestData: UpdateApiKeyRequest, organizationId: string, userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('api_keys')
      .update({ 
        ...requestData, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', keyId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) throw error

    // Create audit log entry
    await supabaseClient.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_action: 'api_key_updated',
      p_details: { api_key_id: keyId, changes: requestData }
    })

    return new Response(
      JSON.stringify({ api_key: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating API key:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update API key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function deleteApiKey(supabaseClient: ReturnType<typeof createClient>, keyId: string, organizationId: string, userId: string) {
  try {
    // Get the API key name before deletion for audit log
    const { data: apiKeyData } = await supabaseClient
      .from('api_keys')
      .select('name')
      .eq('id', keyId)
      .eq('organization_id', organizationId)
      .single()

    const { error } = await supabaseClient
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('organization_id', organizationId)

    if (error) throw error

    // Create audit log entry
    await supabaseClient.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_action: 'api_key_deleted',
      p_details: { api_key_id: keyId, api_key_name: apiKeyData?.name }
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error deleting API key:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete API key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getApiUsage(supabaseClient: ReturnType<typeof createClient>, organizationId: string, limit: number) {
  try {
    const { data, error } = await supabaseClient
      .from('api_usage')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return new Response(
      JSON.stringify({ usage: data || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching API usage:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch API usage' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
