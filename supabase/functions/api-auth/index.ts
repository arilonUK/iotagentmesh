
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AuthValidator } from './auth-validator.ts';
import { RateLimiter } from './rate-limiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing or invalid Authorization header. Expected: Bearer <api_key>' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const providedKey = authHeader.replace('Bearer ', '');
    
    // Initialize services
    const authValidator = new AuthValidator();
    const rateLimiter = new RateLimiter();

    // Validate the API key
    const authResult = await authValidator.validateApiKey(providedKey);
    
    if (!authResult.success) {
      return new Response(
        JSON.stringify(authResult),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limits
    const rateCheck = await rateLimiter.checkRateLimit(authResult.api_key_id!);
    
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded',
          reset_time: rateCheck.resetTime
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Reset': rateCheck.resetTime || ''
          }
        }
      );
    }

    // Update last_used timestamp and increment rate limit
    await Promise.all([
      authValidator.updateLastUsed(authResult.api_key_id!),
      rateLimiter.incrementRateLimit(authResult.api_key_id!)
    ]);

    // Return authentication success
    return new Response(
      JSON.stringify(authResult),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in api-auth function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
