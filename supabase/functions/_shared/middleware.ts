
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface MiddlewareContext {
  request: Request;
  response?: Response;
  user?: {
    id: string;
    email?: string;
    [key: string]: unknown;
  };
  apiKey?: {
    id: string;
    organization_id: string;
    scopes?: string[];
    [key: string]: unknown;
  };
  organizationId?: string;
  error?: string;
  startTime: number;
}

export type MiddlewareFunction = (ctx: MiddlewareContext) => Promise<MiddlewareContext>;

// CORS middleware
export const corsMiddleware: MiddlewareFunction = async (ctx) => {
  console.log('CORS middleware: Processing request');
  
  if (ctx.request.method === 'OPTIONS') {
    ctx.response = new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    });
  }
  
  return ctx;
};

// Logging middleware
export const loggingMiddleware: MiddlewareFunction = async (ctx) => {
  const method = ctx.request.method;
  const url = ctx.request.url;
  const userAgent = ctx.request.headers.get('user-agent') || 'unknown';
  
  console.log(`Request: ${method} ${url}`);
  console.log(`User-Agent: ${userAgent}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  return ctx;
};

// Error handling middleware
export const errorHandlingMiddleware: MiddlewareFunction = async (ctx) => {
  if (ctx.error) {
    console.error('Error middleware: Processing error:', ctx.error);
    
    const processingTime = Date.now() - ctx.startTime;
    
    ctx.response = new Response(
      JSON.stringify({
        success: false,
        error: ctx.error,
        timestamp: new Date().toISOString(),
        processing_time_ms: processingTime
      }),
      {
        status: ctx.error.includes('Rate limit') ? 429 :
               ctx.error.includes('Invalid API key') ? 401 :
               ctx.error.includes('expired') ? 401 :
               ctx.error.includes('disabled') ? 403 : 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json'
        }
      }
    );
  }
  
  return ctx;
};

// Response formatting middleware
export const responseFormattingMiddleware: MiddlewareFunction = async (ctx) => {
  if (ctx.response) {
    return ctx;
  }
  
  const processingTime = Date.now() - ctx.startTime;
  
  console.log(`Response processing complete in ${processingTime}ms`);
  
  const responseData = {
    success: true,
    api_key_id: ctx.apiKey?.id,
    organization_id: ctx.organizationId,
    scopes: ctx.apiKey?.scopes,
    processing_time_ms: processingTime,
    timestamp: new Date().toISOString()
  };
  
  ctx.response = new Response(
    JSON.stringify(responseData),
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json'
      }
    }
  );
  
  return ctx;
};

// Middleware composer
export const composeMiddleware = (...middlewares: MiddlewareFunction[]) => {
  return async (initialCtx: Partial<MiddlewareContext>): Promise<Response> => {
    let ctx: MiddlewareContext = {
      request: initialCtx.request!,
      startTime: initialCtx.startTime || Date.now()
    };
    
    try {
      for (const middleware of middlewares) {
        ctx = await middleware(ctx);
        
        // If middleware sets a response, we can short-circuit
        if (ctx.response) {
          return ctx.response;
        }
        
        // If an error is set, we should stop processing
        if (ctx.error) {
          break;
        }
      }
      
      // If we get here without a response, something went wrong
      if (!ctx.response) {
        ctx.error = 'Internal processing error';
        ctx = await errorHandlingMiddleware(ctx);
      }
      
      return ctx.response!;
    } catch (error) {
      console.error('Middleware composition error:', error);
      ctx.error = 'Internal server error';
      ctx = await errorHandlingMiddleware(ctx);
      return ctx.response!;
    }
  };
};
