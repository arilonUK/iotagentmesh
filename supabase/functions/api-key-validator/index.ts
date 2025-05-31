
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { composeMiddleware, corsMiddleware, loggingMiddleware, errorHandlingMiddleware, responseFormattingMiddleware } from '../_shared/middleware.ts';
import { createValidationMiddleware, apiKeyAuthSchema } from '../_shared/validation.ts';

interface ApiKeyValidationResult {
  success: boolean;
  api_key_id?: string;
  organization_id?: string;
  scopes?: string[];
  error?: string;
}

const apiKeyValidationMiddleware = async (ctx: any) => {
  console.log('API Key validation middleware: Starting validation');
  
  const authHeader = ctx.request.headers.get('Authorization');
  const providedKey = authHeader!.replace('Bearer ', '');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  try {
    // Hash the provided key to match against database
    const encoder = new TextEncoder();
    const data = encoder.encode(providedKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log('API Key validation: Checking database for key hash');
    
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
      .single();
    
    if (keyError || !apiKey) {
      console.error('API Key validation: Key not found in database');
      ctx.error = 'Invalid API key';
      return ctx;
    }
    
    // Check if API key is active
    if (!apiKey.is_active) {
      console.error('API Key validation: Key is disabled');
      ctx.error = 'API key is disabled';
      return ctx;
    }
    
    // Check if API key has expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      console.error('API Key validation: Key has expired');
      ctx.error = 'API key has expired';
      return ctx;
    }
    
    console.log('API Key validation: Key validated successfully');
    
    ctx.apiKey = apiKey;
    ctx.organizationId = apiKey.organization_id;
    
    return ctx;
  } catch (error) {
    console.error('API Key validation error:', error);
    ctx.error = 'API key validation failed';
    return ctx;
  }
};

const updateLastUsedMiddleware = async (ctx: any) => {
  if (!ctx.apiKey) {
    return ctx;
  }
  
  console.log('Update last used middleware: Updating timestamp');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  try {
    const now = new Date();
    await supabaseClient
      .from('api_keys')
      .update({ last_used: now.toISOString() })
      .eq('id', ctx.apiKey.id);
    
    console.log('Update last used middleware: Timestamp updated successfully');
  } catch (error) {
    console.error('Update last used middleware error:', error);
    // Don't fail the request for this non-critical operation
  }
  
  return ctx;
};

serve(async (req) => {
  console.log('=== API Key Validator Function Start ===');
  
  const processRequest = composeMiddleware(
    corsMiddleware,
    loggingMiddleware,
    createValidationMiddleware(apiKeyAuthSchema),
    apiKeyValidationMiddleware,
    updateLastUsedMiddleware,
    responseFormattingMiddleware,
    errorHandlingMiddleware
  );
  
  const response = await processRequest({ request: req });
  
  console.log('=== API Key Validator Function End ===');
  return response;
});
