
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RouteHandler {
  pattern: RegExp;
  handler: string;
}

const routes: RouteHandler[] = [
  { pattern: /^\/api\/devices/, handler: 'api-devices' },
  { pattern: /^\/api\/products/, handler: 'api-products' },
  { pattern: /^\/api\/data/, handler: 'api-data' },
  { pattern: /^\/api\/keys/, handler: 'api-key-management' },
  { pattern: /^\/api\/alarms/, handler: 'api-alarms' },
  { pattern: /^\/api\/endpoints/, handler: 'api-endpoints' },
  { pattern: /^\/api\/profiles/, handler: 'api-profiles' },
  { pattern: /^\/api\/files/, handler: 'api-files' },
  { pattern: /^\/api\/organizations/, handler: 'api-organizations' },
  { pattern: /^\/api\/openapi\.json$/, handler: 'openapi-docs' },
  { pattern: /^\/api\/docs/, handler: 'api-docs' }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
    const route = routes.find(r => r.pattern.test(path))
    
    if (!route) {
      console.log(`No route found for path: ${path}`)
      return new Response(
        JSON.stringify({ 
          error: 'Not Found',
          message: `No handler found for path: ${path}`,
          available_endpoints: [
            '/api/devices',
            '/api/products', 
            '/api/data',
            '/api/keys',
            '/api/alarms',
            '/api/endpoints',
            '/api/profiles',
            '/api/files',
            '/api/organizations',
            '/api/openapi.json',
            '/api/docs'
          ]
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client for forwarding requests
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Prepare the request body
    let body = null
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      body = await req.text()
    }

    // Create the target URL for the specific function
    const targetUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${route.handler}${path}`
    console.log(`Forwarding to: ${targetUrl}`)

    // Create a new request object for the target function
    const targetRequest = new Request(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
        'Content-Type': req.headers.get('Content-Type') || 'application/json',
        'x-forwarded-path': path
      },
      body: body
    })

    // Forward the request directly
    const response = await fetch(targetRequest)
    const responseData = await response.text()
    
    console.log(`Response from ${route.handler}: ${response.status}`)
    
    // Log the request for monitoring
    try {
      await supabaseClient
        .from('api_requests_log')
        .insert({
          request_id: crypto.randomUUID(),
          endpoint: path,
          method: req.method,
          response_status: response.status,
          processing_time_ms: 0,
          ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For'),
          user_agent: req.headers.get('User-Agent')
        })
    } catch (logError) {
      console.error('Failed to log request:', logError)
    }

    return new Response(responseData, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json'
      }
    })

  } catch (error) {
    console.error('API Gateway error:', error)
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

async function handleOpenApiDocs() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "IoT Platform API",
      description: "Comprehensive API for IoT device management and data operations",
      version: "1.0.0"
    },
    servers: [
      {
        url: "https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway",
        description: "Production API Gateway"
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        },
        ApiKeyAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key"
        }
      }
    },
    security: [
      { BearerAuth: [] },
      { ApiKeyAuth: [] }
    ],
    paths: {
      "/api/devices": {
        get: {
          summary: "Get all devices",
          responses: {
            "200": {
              description: "List of devices"
            }
          }
        },
        post: {
          summary: "Create a new device",
          responses: {
            "201": {
              description: "Device created successfully"
            }
          }
        }
      },
      "/api/endpoints": {
        get: {
          summary: "Get all endpoints",
          responses: {
            "200": {
              description: "List of endpoints"
            }
          }
        },
        post: {
          summary: "Create a new endpoint",
          responses: {
            "201": {
              description: "Endpoint created successfully"
            }
          }
        }
      },
      "/api/profiles/me": {
        get: {
          summary: "Get current user profile",
          responses: {
            "200": {
              description: "User profile"
            }
          }
        },
        put: {
          summary: "Update current user profile",
          responses: {
            "200": {
              description: "Profile updated successfully"
            }
          }
        }
      },
      "/api/files/profiles": {
        get: {
          summary: "Get file storage profiles",
          responses: {
            "200": {
              description: "List of storage profiles"
            }
          }
        },
        post: {
          summary: "Create storage profile",
          responses: {
            "201": {
              description: "Storage profile created"
            }
          }
        }
      },
      "/api/organizations": {
        get: {
          summary: "Get user organizations",
          responses: {
            "200": {
              description: "List of organizations"
            }
          }
        }
      }
    }
  }

  return new Response(
    JSON.stringify(openApiSpec, null, 2),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  )
}

async function handleApiDocs() {
  const docsHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>IoT Platform API Documentation</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
      <script>
        SwaggerUIBundle({
          url: '/api/openapi.json',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.presets.standalone
          ]
        });
      </script>
    </body>
    </html>
  `

  return new Response(docsHtml, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html'
    }
  })
}
