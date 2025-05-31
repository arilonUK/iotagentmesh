
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { composeMiddleware, corsMiddleware, loggingMiddleware, errorHandlingMiddleware } from '../_shared/middleware.ts';

const rateLimitCheckMiddleware = async (ctx: any) => {
  console.log('Rate limit check middleware: Starting check');
  
  const apiKeyId = ctx.request.headers.get('x-api-key-id');
  
  if (!apiKeyId) {
    ctx.error = 'Missing API key ID header';
    return ctx;
  }
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  try {
    const now = new Date();
    
    console.log('Rate limit check: Querying rate limit buckets');
    
    const { data: rateLimits } = await supabaseClient
      .from('rate_limit_buckets')
      .select('*')
      .eq('api_key_id', apiKeyId);
    
    if (!rateLimits || rateLimits.length === 0) {
      console.log('Rate limit check: No rate limits found, allowing request');
      ctx.rateLimitAllowed = true;
      return ctx;
    }
    
    for (const bucket of rateLimits) {
      // Reset bucket if time has passed
      if (new Date(bucket.reset_time) <= now) {
        console.log('Rate limit check: Resetting expired bucket');
        await resetBucket(supabaseClient, bucket);
      } else if (bucket.current_count >= bucket.limit_value) {
        console.log('Rate limit check: Rate limit exceeded');
        ctx.error = 'Rate limit exceeded';
        ctx.resetTime = bucket.reset_time;
        return ctx;
      }
    }
    
    console.log('Rate limit check: Rate limit check passed');
    ctx.rateLimitAllowed = true;
    
    return ctx;
  } catch (error) {
    console.error('Rate limit check error:', error);
    ctx.error = 'Rate limit check failed';
    return ctx;
  }
};

const incrementRateLimitMiddleware = async (ctx: any) => {
  if (!ctx.rateLimitAllowed) {
    return ctx;
  }
  
  const apiKeyId = ctx.request.headers.get('x-api-key-id');
  
  if (!apiKeyId) {
    return ctx;
  }
  
  console.log('Increment rate limit middleware: Incrementing counters');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  try {
    const now = new Date();
    
    const { data: rateLimits } = await supabaseClient
      .from('rate_limit_buckets')
      .select('*')
      .eq('api_key_id', apiKeyId);
    
    if (rateLimits && rateLimits.length > 0) {
      for (const bucket of rateLimits) {
        if (new Date(bucket.reset_time) > now) {
          await supabaseClient
            .from('rate_limit_buckets')
            .update({ 
              current_count: bucket.current_count + 1,
              updated_at: now.toISOString()
            })
            .eq('id', bucket.id);
        }
      }
    }
    
    console.log('Increment rate limit middleware: Counters updated');
  } catch (error) {
    console.error('Increment rate limit middleware error:', error);
    // Don't fail the request for this non-critical operation
  }
  
  return ctx;
};

const rateLimitResponseMiddleware = async (ctx: any) => {
  if (ctx.response) {
    return ctx;
  }
  
  const processingTime = Date.now() - ctx.startTime;
  
  const responseData = {
    success: true,
    rate_limit_allowed: ctx.rateLimitAllowed,
    processing_time_ms: processingTime,
    timestamp: new Date().toISOString()
  };
  
  if (ctx.resetTime) {
    responseData.reset_time = ctx.resetTime;
  }
  
  ctx.response = new Response(
    JSON.stringify(responseData),
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key-id',
        'Content-Type': 'application/json'
      }
    }
  );
  
  return ctx;
};

async function resetBucket(supabaseClient: any, bucket: any): Promise<void> {
  const now = new Date();
  const resetTime = bucket.bucket_type === 'hourly' 
    ? new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    : bucket.bucket_type === 'daily'
    ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    : new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  await supabaseClient
    .from('rate_limit_buckets')
    .update({
      current_count: 0,
      reset_time: resetTime,
      updated_at: now.toISOString()
    })
    .eq('id', bucket.id);
}

serve(async (req) => {
  console.log('=== Rate Limit Checker Function Start ===');
  
  const processRequest = composeMiddleware(
    corsMiddleware,
    loggingMiddleware,
    rateLimitCheckMiddleware,
    incrementRateLimitMiddleware,
    rateLimitResponseMiddleware,
    errorHandlingMiddleware
  );
  
  const response = await processRequest({ request: req });
  
  console.log('=== Rate Limit Checker Function End ===');
  return response;
});
