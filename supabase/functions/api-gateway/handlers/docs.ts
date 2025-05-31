
export async function handleOpenApiDocs(): Promise<Response> {
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
  };

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  return new Response(
    JSON.stringify(openApiSpec, null, 2),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function handleApiDocs(): Promise<Response> {
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
  `;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  return new Response(docsHtml, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html'
    }
  });
}
