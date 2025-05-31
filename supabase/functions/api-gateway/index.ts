
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
  console.log(`=== API GATEWAY START ===`);
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    console.log(`Parsed URL pathname: ${url.pathname}`);
    
    // Get the path and normalize it
    let path = url.pathname;
    console.log(`Original path: ${path}`);
    
    // If the path starts with /api-gateway, strip it
    if (path.startsWith('/api-gateway')) {
      path = path.substring('/api-gateway'.length);
      console.log(`Stripped /api-gateway prefix, new path: ${path}`);
    }
    
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    console.log(`Final routing path: ${path}`);
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    console.log(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);
    
    // Route the request
    const response = await router.route(req, path, authHeader);
    console.log(`Router response status: ${response.status}`);
    
    // Add CORS headers to response
    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    
    console.log(`=== API GATEWAY END ===`);
    
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error in API Gateway:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack 
      }),
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
