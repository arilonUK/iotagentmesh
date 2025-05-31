
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
  { pattern: /^\/api\/openapi\.json$/, handler: 'openapi-docs' },
  { pattern: /^\/api\/docs/, handler: 'api-docs' }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname

    console.log(`API Gateway: ${req.method} ${path}`)

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
      return new Response(
        JSON.stringify({ 
          error: 'Not Found',
          message: `No handler found for path: ${path}`,
          available_endpoints: [
            '/api/devices',
            '/api/products', 
            '/api/data',
            '/api/keys',
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

    // Forward request to appropriate handler
    const handlerUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${route.handler}`
    
    // Prepare the request body
    let body = null
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      body = await req.text()
    }

    // Forward the request
    const response = await fetch(handlerUrl, {
      method: req.method,
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
        'Content-Type': req.headers.get('Content-Type') || 'application/json',
        'x-forwarded-path': path
      },
      body: body
    })

    const responseData = await response.text()
    
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
              description: "List of devices",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      devices: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Device" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create a new device",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateDeviceRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "Device created successfully"
            }
          }
        }
      },
      "/api/keys": {
        get: {
          summary: "Get all API keys",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": {
              description: "List of API keys",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      api_keys: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ApiKey" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create a new API key",
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateApiKeyRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "API key created successfully"
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
