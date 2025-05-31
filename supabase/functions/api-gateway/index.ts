
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface RouteHandler {
  pattern: RegExp;
  function: string;
  methods: string[];
}

// Route configuration
const routes: RouteHandler[] = [
  {
    pattern: /^\/api\/devices(\/.*)?$/,
    function: 'api-devices',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  {
    pattern: /^\/api\/data-buckets(\/.*)?$/,
    function: 'api-data',
    methods: ['GET', 'POST']
  },
  {
    pattern: /^\/api\/devices\/[^\/]+\/readings(\/.*)?$/,
    function: 'api-data',
    methods: ['GET', 'POST']
  },
  {
    pattern: /^\/api\/products(\/.*)?$/,
    function: 'api-products',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  {
    pattern: /^\/api\/webhooks(\/.*)?$/,
    function: 'webhook-manager',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  {
    pattern: /^\/api\/webhook\/dispatch(\/.*)?$/,
    function: 'webhook-dispatcher',
    methods: ['POST']
  },
  {
    pattern: /^\/api\/webhook\/broadcast(\/.*)?$/,
    function: 'webhook-dispatcher',
    methods: ['POST']
  },
  {
    pattern: /^\/api\/webhook\/deliveries(\/.*)?$/,
    function: 'webhook-dispatcher',
    methods: ['GET']
  },
  {
    pattern: /^\/api\/auth(\/.*)?$/,
    function: 'api-auth',
    methods: ['POST']
  },
  {
    pattern: /^\/api\/rate-limit(\/.*)?$/,
    function: 'rate-limiter',
    methods: ['POST']
  },
  {
    pattern: /^\/api\/usage(\/.*)?$/,
    function: 'usage-tracker',
    methods: ['GET', 'POST', 'DELETE']
  }
]

serve(async (req) => {
  const startTime = Date.now()
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const pathname = url.pathname
    
    console.log(`[API Gateway] ${req.method} ${pathname}`)

    // Handle OpenAPI documentation requests
    if (pathname === '/api/docs' || pathname === '/api/openapi.json') {
      return handleDocumentationRequest(pathname)
    }

    // Find matching route
    const matchedRoute = routes.find(route => {
      return route.pattern.test(pathname) && route.methods.includes(req.method)
    })

    if (!matchedRoute) {
      console.log(`[API Gateway] No route found for ${req.method} ${pathname}`)
      return new Response(
        JSON.stringify({ 
          error: 'Not Found',
          message: `No API endpoint found for ${req.method} ${pathname}`,
          available_endpoints: routes.map(r => ({
            pattern: r.pattern.source,
            methods: r.methods
          }))
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Route to appropriate function
    console.log(`[API Gateway] Routing to function: ${matchedRoute.function}`)

    // Create new request with modified headers
    const forwardedHeaders = new Headers(req.headers)
    forwardedHeaders.set('X-Forwarded-For', req.headers.get('CF-Connecting-IP') || 'unknown')
    forwardedHeaders.set('X-Gateway-Route', matchedRoute.function)
    forwardedHeaders.set('X-Gateway-Start-Time', startTime.toString())

    // Forward request to the appropriate function
    const { data, error } = await supabaseClient.functions.invoke(matchedRoute.function, {
      method: req.method,
      headers: Object.fromEntries(forwardedHeaders.entries()),
      body: req.body ? await req.text() : undefined
    })

    const processingTime = Date.now() - startTime

    if (error) {
      console.error(`[API Gateway] Error from ${matchedRoute.function}:`, error)
      
      // Log the error
      await logRequest(supabaseClient, {
        method: req.method,
        pathname,
        status: 500,
        processing_time: processingTime,
        error: error.message,
        function_name: matchedRoute.function,
        ip_address: req.headers.get('CF-Connecting-IP'),
        user_agent: req.headers.get('User-Agent')
      })

      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: error.message || 'An error occurred while processing the request'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract status from function response
    const status = data?.status || 200
    const responseData = data?.data || data

    // Log successful request
    await logRequest(supabaseClient, {
      method: req.method,
      pathname,
      status,
      processing_time: processingTime,
      function_name: matchedRoute.function,
      ip_address: req.headers.get('CF-Connecting-IP'),
      user_agent: req.headers.get('User-Agent')
    })

    console.log(`[API Gateway] Request completed in ${processingTime}ms`)

    return new Response(
      JSON.stringify(responseData),
      { 
        status,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Processing-Time': processingTime.toString(),
          'X-Gateway-Version': '1.0'
        }
      }
    )

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('[API Gateway] Unexpected error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Processing-Time': processingTime.toString()
        }
      }
    )
  }
})

async function logRequest(supabaseClient: any, logData: {
  method: string;
  pathname: string;
  status: number;
  processing_time: number;
  error?: string;
  function_name: string;
  ip_address?: string | null;
  user_agent?: string | null;
}) {
  try {
    await supabaseClient
      .from('api_gateway_logs')
      .insert({
        request_id: crypto.randomUUID(),
        method: logData.method,
        pathname: logData.pathname,
        status_code: logData.status,
        processing_time_ms: logData.processing_time,
        error_message: logData.error,
        function_name: logData.function_name,
        ip_address: logData.ip_address,
        user_agent: logData.user_agent
      })
  } catch (error) {
    console.error('[API Gateway] Failed to log request:', error)
  }
}

function handleDocumentationRequest(pathname: string): Response {
  if (pathname === '/api/openapi.json') {
    const openApiSpec = generateOpenAPISpec()
    return new Response(
      JSON.stringify(openApiSpec, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
      }
    )
  }

  // Return interactive documentation HTML
  const docsHtml = generateDocsHTML()
  return new Response(docsHtml, {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'text/html'
    }
  })
}

function generateOpenAPISpec() {
  return {
    openapi: "3.0.3",
    info: {
      title: "IoT Platform API",
      description: "Comprehensive API for IoT device management, data collection, and webhook integration",
      version: "1.0.0",
      contact: {
        name: "API Support",
        email: "support@iot-platform.com"
      }
    },
    servers: [
      {
        url: "https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway",
        description: "Production server"
      }
    ],
    security: [
      {
        bearerAuth: []
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key",
          description: "Use your API key in the format: Bearer iot_xxxxxxxxxx"
        }
      },
      schemas: {
        Device: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            type: { type: "string" },
            status: { type: "string", enum: ["online", "offline", "maintenance"] },
            description: { type: "string" },
            organization_id: { type: "string", format: "uuid" },
            product_template_id: { type: "string", format: "uuid" },
            last_active_at: { type: "string", format: "date-time" }
          }
        },
        DeviceReading: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            device_id: { type: "string", format: "uuid" },
            reading_type: { type: "string" },
            value: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
            metadata: { type: "object" }
          }
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            version: { type: "string" },
            category: { type: "string" },
            status: { type: "string", enum: ["draft", "published", "archived"] },
            organization_id: { type: "string", format: "uuid" }
          }
        },
        Webhook: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            url: { type: "string", format: "uri" },
            events: { type: "array", items: { type: "string" } },
            enabled: { type: "boolean" },
            secret: { type: "string" },
            retry_count: { type: "integer", minimum: 0, maximum: 10 },
            timeout_seconds: { type: "integer", minimum: 1, maximum: 300 }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            details: { type: "object" }
          }
        }
      }
    },
    paths: {
      "/api/devices": {
        get: {
          summary: "List devices",
          description: "Retrieve all devices for the authenticated organization",
          responses: {
            "200": {
              description: "Successful response",
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
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" }
          }
        },
        post: {
          summary: "Create device",
          description: "Create a new device",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "type"],
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    status: { type: "string" },
                    description: { type: "string" },
                    product_template_id: { type: "string", format: "uuid" }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Device created successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Device" }
                }
              }
            }
          }
        }
      },
      "/api/devices/{id}": {
        get: {
          summary: "Get device",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          responses: {
            "200": {
              description: "Device details",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Device" }
                }
              }
            }
          }
        },
        put: {
          summary: "Update device",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    status: { type: "string" },
                    description: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Device updated successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Device" }
                }
              }
            }
          }
        },
        delete: {
          summary: "Delete device",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          responses: {
            "200": {
              description: "Device deleted successfully"
            }
          }
        }
      },
      "/api/devices/{id}/readings": {
        get: {
          summary: "Get device readings",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            },
            {
              name: "reading_type",
              in: "query",
              schema: { type: "string" }
            },
            {
              name: "start_time",
              in: "query",
              schema: { type: "string", format: "date-time" }
            },
            {
              name: "end_time",
              in: "query",
              schema: { type: "string", format: "date-time" }
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 1000, default: 100 }
            }
          ],
          responses: {
            "200": {
              description: "Device readings",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      readings: {
                        type: "array",
                        items: { $ref: "#/components/schemas/DeviceReading" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Send device reading",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["reading_type", "value"],
                  properties: {
                    reading_type: { type: "string" },
                    value: { type: "number" },
                    timestamp: { type: "string", format: "date-time" },
                    metadata: { type: "object" }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Reading created successfully"
            }
          }
        }
      },
      "/api/webhooks": {
        get: {
          summary: "List webhooks",
          responses: {
            "200": {
              description: "List of webhook endpoints",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      webhooks: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Webhook" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create webhook",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["url", "events"],
                  properties: {
                    url: { type: "string", format: "uri" },
                    events: { type: "array", items: { type: "string" } },
                    secret: { type: "string" },
                    enabled: { type: "boolean", default: true },
                    retry_count: { type: "integer", default: 3 },
                    timeout_seconds: { type: "integer", default: 30 }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Webhook created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      webhook: { $ref: "#/components/schemas/Webhook" },
                      secret: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function generateDocsHTML(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IoT Platform API Documentation</title>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
        #swagger-ui { max-width: 1200px; margin: 0 auto; }
        .swagger-ui .topbar { display: none; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script>
        SwaggerUIBundle({
            url: './openapi.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            tryItOutEnabled: true,
            requestInterceptor: (request) => {
                // Add base URL if not present
                if (!request.url.startsWith('http')) {
                    request.url = 'https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway' + request.url;
                }
                return request;
            }
        });
    </script>
</body>
</html>
  `
}
