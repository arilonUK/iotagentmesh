
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { APIRouter } from './router.ts';
import { forwardToDevicesHandler } from './handlers/devices.ts';
import { forwardToAlarmsHandler } from './handlers/alarms.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Initialize router and add routes
const router = new APIRouter();

// Add device routes
router.addRoute('/api/devices', forwardToDevicesHandler);
router.addRoute('/api/devices/*', forwardToDevicesHandler);

// Add alarm routes  
router.addRoute('/api/alarms', forwardToAlarmsHandler);
router.addRoute('/api/alarms/*', forwardToAlarmsHandler);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    console.log(`API Gateway: ${req.method} ${url.pathname}`);
    
    // Strip the /api-gateway prefix if present
    let path = url.pathname;
    if (path.startsWith('/api-gateway')) {
      path = path.replace('/api-gateway', '');
      console.log(`Stripped prefix, new path: ${path}`);
    }
    
    // API versioning (assume v1 for now)
    console.log(`API Version: v1, Path: ${path}`);
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    
    // Route the request
    const response = await router.route(req, path, authHeader);
    
    // Add CORS headers to response
    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error in API Gateway:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

