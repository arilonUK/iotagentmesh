
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { findRoute, getAvailableEndpoints } from './router.ts'
import { logRequest } from './logging.ts'
import { handleOpenApiDocs, handleApiDocs } from './handlers/docs.ts'
import { forwardToDevicesHandler } from './handlers/devices.ts'
import { forwardToProductsHandler } from './handlers/products.ts'
import { forwardToAlarmsHandler } from './handlers/alarms.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const url = new URL(req.url)
    let path = url.pathname

    console.log(`API Gateway: ${req.method} ${path}`)

    // Strip the /api-gateway prefix if it exists
    if (path.startsWith('/api-gateway')) {
      path = path.replace('/api-gateway', '')
      console.log(`Stripped prefix, new path: ${path}`)
    }

    // Handle OpenAPI documentation
    if (path === '/api/openapi.json') {
      return await handleOpenApiDocs()
    }

    if (path.startsWith('/api/docs')) {
      return await handleApiDocs()
    }

    // Find matching route
    const route = findRoute(path)
    
    if (!route) {
      console.log(`No route found for path: ${path}`)
      return new Response(
        JSON.stringify({ 
          error: 'Not Found',
          message: `No handler found for path: ${path}`,
          available_endpoints: getAvailableEndpoints()
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const authHeader = req.headers.get('Authorization')
    let response: Response

    // Route to specific handlers for better organization
    if (route.handler === 'api-devices') {
      response = await forwardToDevicesHandler(req, path, authHeader)
    } else if (route.handler === 'api-products') {
      response = await forwardToProductsHandler(req, path, authHeader)
    } else if (route.handler === 'api-alarms') {
      response = await forwardToAlarmsHandler(req, path, authHeader)
    } else {
      // Generic forwarding for other handlers
      let body = null
      if (req.method !== 'GET' && req.method !== 'DELETE') {
        body = await req.text()
      }

      const targetUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${route.handler}${path}`
      console.log(`Forwarding to: ${targetUrl}`)

      const targetRequest = new Request(targetUrl, {
        method: req.method,
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': req.headers.get('Content-Type') || 'application/json',
          'x-forwarded-path': path
        },
        body: body
      })

      response = await fetch(targetRequest)
    }

    const responseData = await response.text()
    console.log(`Response from ${route.handler}: ${response.status}`)
    
    // Log the request for monitoring
    const processingTime = Date.now() - startTime
    await logRequest(path, req.method, response.status, req.headers, processingTime)

    return new Response(responseData, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json'
      }
    })

  } catch (error) {
    console.error('API Gateway error:', error)
    const processingTime = Date.now() - startTime
    await logRequest(url.pathname, req.method, 500, req.headers, processingTime)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
