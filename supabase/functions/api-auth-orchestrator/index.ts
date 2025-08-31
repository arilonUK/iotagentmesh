
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { composeMiddleware, corsMiddleware, loggingMiddleware, errorHandlingMiddleware, responseFormattingMiddleware } from '../_shared/middleware.ts';
import { createValidationMiddleware, apiKeyAuthSchema } from '../_shared/validation.ts';

const orchestratorMiddleware = async (ctx: Record<string, unknown>) => {
  console.log('Orchestrator middleware: Starting API auth orchestration');
  
  const authHeader = ctx.request.headers.get('Authorization');
  const providedKey = authHeader!.replace('Bearer ', '');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  try {
    // Step 1: Validate API Key
    console.log('Orchestrator: Step 1 - Validating API key');
    const keyValidationResponse = await supabaseClient.functions.invoke('api-key-validator', {
      headers: { Authorization: authHeader! }
    });
    
    if (keyValidationResponse.error || !keyValidationResponse.data?.success) {
      console.error('Orchestrator: API key validation failed');
      ctx.error = keyValidationResponse.data?.error || 'API key validation failed';
      return ctx;
    }
    
    const { api_key_id, organization_id, scopes } = keyValidationResponse.data;
    
    // Step 2: Check Rate Limits
    console.log('Orchestrator: Step 2 - Checking rate limits');
    const rateLimitResponse = await supabaseClient.functions.invoke('rate-limit-checker', {
      headers: { 
        'x-api-key-id': api_key_id
      }
    });
    
    if (rateLimitResponse.error || !rateLimitResponse.data?.rate_limit_allowed) {
      console.error('Orchestrator: Rate limit check failed');
      ctx.error = rateLimitResponse.data?.error || 'Rate limit exceeded';
      if (rateLimitResponse.data?.reset_time) {
        ctx.resetTime = rateLimitResponse.data.reset_time;
      }
      return ctx;
    }
    
    console.log('Orchestrator: All checks passed successfully');
    
    // Set context for response formatting
    ctx.apiKey = { id: api_key_id, scopes };
    ctx.organizationId = organization_id;
    
    return ctx;
  } catch (error) {
    console.error('Orchestrator middleware error:', error);
    ctx.error = 'Authentication orchestration failed';
    return ctx;
  }
};

const orchestratorResponseMiddleware = async (ctx: Record<string, unknown>) => {
  if (ctx.response) {
    return ctx;
  }
  
  const processingTime = Date.now() - ctx.startTime;
  
  console.log(`Orchestrator response: Processing complete in ${processingTime}ms`);
  
  const responseData = {
    success: true,
    api_key_id: ctx.apiKey?.id,
    organization_id: ctx.organizationId,
    scopes: ctx.apiKey?.scopes,
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
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json',
        ...(ctx.resetTime && { 'X-RateLimit-Reset': ctx.resetTime })
      }
    }
  );
  
  return ctx;
};

serve(async (req) => {
  console.log('=== API Auth Orchestrator Function Start ===');
  
  const processRequest = composeMiddleware(
    corsMiddleware,
    loggingMiddleware,
    createValidationMiddleware(apiKeyAuthSchema),
    orchestratorMiddleware,
    orchestratorResponseMiddleware,
    errorHandlingMiddleware
  );
  
  const response = await processRequest({ request: req });
  
  console.log('=== API Auth Orchestrator Function End ===');
  return response;
});
