
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateApiKeyRequest {
  name: string;
  scopes: string[];
  expiration?: string; // 'never' or number of months
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

    // Check if user has permission to create API keys (admin or owner)
    if (!['admin', 'owner'].includes(orgMember.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to create API keys' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestData: CreateApiKeyRequest = await req.json()
    
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
    
    // Hash the key for storage using Web Crypto API
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
        organization_id: orgMember.organization_id,
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

    // Create initial rate limit buckets based on subscription plan
    const { data: org } = await supabaseClient
      .from('organizations')
      .select('subscription_plan_id, subscription_plans(*)')
      .eq('id', orgMember.organization_id)
      .single()

    if (org?.subscription_plans) {
      const plan = org.subscription_plans
      const buckets = []
      
      if (plan.requests_per_hour) {
        buckets.push({
          api_key_id: apiKey.id,
          bucket_type: 'hourly',
          limit_value: plan.requests_per_hour,
          reset_time: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
        })
      }
      
      if (plan.requests_per_month) {
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        nextMonth.setDate(1)
        nextMonth.setHours(0, 0, 0, 0)
        
        buckets.push({
          api_key_id: apiKey.id,
          bucket_type: 'monthly',
          limit_value: plan.requests_per_month,
          reset_time: nextMonth.toISOString()
        })
      }

      if (buckets.length > 0) {
        await supabaseClient
          .from('rate_limit_buckets')
          .insert(buckets)
      }
    }

    // Log the API key creation
    await supabaseClient
      .from('api_requests_log')
      .insert({
        organization_id: orgMember.organization_id,
        request_id: crypto.randomUUID(),
        endpoint: '/generate-api-key',
        method: 'POST',
        response_status: 201,
        processing_time_ms: 0,
        ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For'),
        user_agent: req.headers.get('User-Agent')
      })

    // Return the API key and unhashed key (only time it's shown)
    return new Response(
      JSON.stringify({
        api_key: apiKey,
        full_key: fullKey
      }),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in generate-api-key function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
