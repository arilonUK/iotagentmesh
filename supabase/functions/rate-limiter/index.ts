
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitRequest {
  api_key_id: string;
  organization_id: string;
  endpoint?: string;
  method?: string;
}

interface RateLimitResponse {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset_time: string;
  retry_after?: number;
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

    const requestData: RateLimitRequest = await req.json()
    
    if (!requestData.api_key_id || !requestData.organization_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: api_key_id and organization_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    
    // Get all rate limit buckets for this API key
    const { data: buckets, error: bucketsError } = await supabaseClient
      .from('rate_limit_buckets')
      .select('*')
      .eq('api_key_id', requestData.api_key_id)

    if (bucketsError) {
      console.error('Error fetching rate limit buckets:', bucketsError)
      return new Response(
        JSON.stringify({ error: 'Failed to check rate limits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let rateLimitResponse: RateLimitResponse = {
      allowed: true,
      limit: 0,
      remaining: 0,
      reset_time: now.toISOString()
    }

    // Check each rate limit bucket
    for (const bucket of buckets || []) {
      const resetTime = new Date(bucket.reset_time)
      
      // Reset bucket if time has passed
      if (resetTime <= now) {
        const newResetTime = calculateNextResetTime(bucket.bucket_type, now)
        
        await supabaseClient
          .from('rate_limit_buckets')
          .update({
            current_count: 0,
            reset_time: newResetTime.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', bucket.id)

        bucket.current_count = 0
        bucket.reset_time = newResetTime.toISOString()
      }

      // Check if limit is exceeded
      if (bucket.current_count >= bucket.limit_value) {
        const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000)
        
        rateLimitResponse = {
          allowed: false,
          limit: bucket.limit_value,
          remaining: 0,
          reset_time: bucket.reset_time,
          retry_after: retryAfter
        }
        break
      }

      // Update the most restrictive limit info
      const remaining = bucket.limit_value - bucket.current_count
      if (bucket.limit_value > rateLimitResponse.limit) {
        rateLimitResponse = {
          allowed: true,
          limit: bucket.limit_value,
          remaining: remaining,
          reset_time: bucket.reset_time
        }
      }
    }

    // If allowed, increment counters
    if (rateLimitResponse.allowed && buckets && buckets.length > 0) {
      for (const bucket of buckets) {
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

    // Log the rate limit check
    await supabaseClient
      .from('api_requests_log')
      .insert({
        api_key_id: requestData.api_key_id,
        organization_id: requestData.organization_id,
        request_id: crypto.randomUUID(),
        endpoint: requestData.endpoint || '/rate-limit-check',
        method: requestData.method || 'POST',
        response_status: rateLimitResponse.allowed ? 200 : 429,
        processing_time_ms: Date.now() - now.getTime(),
        ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For'),
        user_agent: req.headers.get('User-Agent')
      })

    const status = rateLimitResponse.allowed ? 200 : 429
    const headers = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': rateLimitResponse.limit.toString(),
      'X-RateLimit-Remaining': rateLimitResponse.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResponse.reset_time
    }

    if (rateLimitResponse.retry_after) {
      headers['Retry-After'] = rateLimitResponse.retry_after.toString()
    }

    return new Response(
      JSON.stringify(rateLimitResponse),
      { status, headers }
    )

  } catch (error) {
    console.error('Error in rate-limiter function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateNextResetTime(bucketType: string, currentTime: Date): Date {
  const resetTime = new Date(currentTime)
  
  switch (bucketType) {
    case 'hourly':
      resetTime.setHours(resetTime.getHours() + 1, 0, 0, 0)
      break
    case 'daily':
      resetTime.setDate(resetTime.getDate() + 1)
      resetTime.setHours(0, 0, 0, 0)
      break
    case 'monthly':
      resetTime.setMonth(resetTime.getMonth() + 1, 1)
      resetTime.setHours(0, 0, 0, 0)
      break
    default:
      resetTime.setHours(resetTime.getHours() + 1, 0, 0, 0)
  }
  
  return resetTime
}
