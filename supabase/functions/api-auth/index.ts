
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthResult {
  success: boolean;
  api_key_id?: string;
  organization_id?: string;
  scopes?: string[];
  error?: string;
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

    // Get the API key from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing or invalid Authorization header. Expected: Bearer <api_key>' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const providedKey = authHeader.replace('Bearer ', '')
    
    // Validate API key format
    if (!providedKey.startsWith('iot_') || providedKey.length < 32) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid API key format' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Hash the provided key to match against database
    const encoder = new TextEncoder()
    const data = encoder.encode(providedKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Find the API key in database
    const { data: apiKey, error: keyError } = await supabaseClient
      .from('api_keys')
      .select(`
        id,
        organization_id,
        name,
        scopes,
        expires_at,
        is_active,
        organizations (
          id,
          name,
          subscription_plan_id
        )
      `)
      .eq('key_hash', keyHash)
      .single()

    if (keyError || !apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid API key' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if API key is active
    if (!apiKey.is_active) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API key is disabled' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if API key has expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API key has expired' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check rate limits
    const now = new Date()
    const { data: rateLimits } = await supabaseClient
      .from('rate_limit_buckets')
      .select('*')
      .eq('api_key_id', apiKey.id)

    let rateLimitExceeded = false
    let resetTime = null

    if (rateLimits && rateLimits.length > 0) {
      for (const bucket of rateLimits) {
        // Reset bucket if time has passed
        if (new Date(bucket.reset_time) <= now) {
          await supabaseClient
            .from('rate_limit_buckets')
            .update({
              current_count: 0,
              reset_time: bucket.bucket_type === 'hourly' 
                ? new Date(now.getTime() + 60 * 60 * 1000).toISOString()
                : bucket.bucket_type === 'daily'
                ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
                : new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
              updated_at: now.toISOString()
            })
            .eq('id', bucket.id)
        } else if (bucket.current_count >= bucket.limit_value) {
          rateLimitExceeded = true
          resetTime = bucket.reset_time
          break
        }
      }
    }

    if (rateLimitExceeded) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded',
          reset_time: resetTime
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Reset': resetTime || ''
          }
        }
      )
    }

    // Update last_used timestamp
    await supabaseClient
      .from('api_keys')
      .update({ last_used: now.toISOString() })
      .eq('id', apiKey.id)

    // Increment rate limit counters
    if (rateLimits && rateLimits.length > 0) {
      for (const bucket of rateLimits) {
        if (new Date(bucket.reset_time) > now) {
          await supabaseClient
            .from('rate_limit_buckets')
            .update({ 
              current_count: bucket.current_count + 1,
              updated_at: now.toISOString()
            })
            .eq('id', bucket.id)
        }
      }
    }

    // Return authentication success with context
    const authResult: AuthResult = {
      success: true,
      api_key_id: apiKey.id,
      organization_id: apiKey.organization_id,
      scopes: apiKey.scopes
    }

    return new Response(
      JSON.stringify(authResult),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in api-auth function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
