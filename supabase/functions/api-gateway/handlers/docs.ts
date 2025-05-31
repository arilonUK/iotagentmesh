
export async function handleOpenApiDocs(): Promise<Response> {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "IoT Platform API",
      description: "Comprehensive REST API for IoT device management, data operations, and platform integration",
      version: "2.0.0",
      contact: {
        name: "API Support",
        email: "support@iotagentmesh.com"
      }
    },
    servers: [
      {
        url: "https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway",
        description: "Production API Gateway"
      },
      {
        url: "http://127.0.0.1:54321/functions/v1/api-gateway", 
        description: "Local Development"
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key",
          description: "API key authentication using format: Bearer iot_your_api_key_here"
        },
        JWTAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token authentication for user sessions"
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
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            last_seen: { type: "string", format: "date-time" }
          }
        },
        DeviceReading: {
          type: "object",
          properties: {
            device_id: { type: "string", format: "uuid" },
            timestamp: { type: "string", format: "date-time" },
            readings: { 
              type: "object",
              additionalProperties: true,
              description: "Key-value pairs of sensor readings"
            },
            metadata: {
              type: "object",
              additionalProperties: true
            }
          }
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            device_type: { type: "string" },
            data_schema: { type: "object" },
            organization_id: { type: "string", format: "uuid" }
          }
        },
        Endpoint: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            type: { type: "string", enum: ["webhook", "email", "sms", "device_action"] },
            enabled: { type: "boolean" },
            configuration: { type: "object" },
            organization_id: { type: "string", format: "uuid" }
          }
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            processing_time_ms: { type: "number" }
          }
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            timestamp: { type: "string", format: "date-time" },
            processing_time_ms: { type: "number" }
          }
        }
      }
    },
    security: [
      { ApiKeyAuth: [] },
      { JWTAuth: [] }
    ],
    paths: {
      "/api/devices": {
        get: {
          summary: "List all devices",
          description: "Retrieve all devices for the authenticated organization",
          tags: ["Devices"],
          security: [{ ApiKeyAuth: [] }, { JWTAuth: [] }],
          responses: {
            "200": {
              description: "List of devices retrieved successfully",
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
            "403": { $ref: "#/components/responses/Forbidden" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        },
        post: {
          summary: "Create a new device",
          description: "Create a new device in the organization",
          tags: ["Devices"],
          security: [{ ApiKeyAuth: [] }, { JWTAuth: [] }],
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
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        }
      },
      "/api/devices/{deviceId}": {
        get: {
          summary: "Get device by ID",
          description: "Retrieve a specific device by its ID",
          tags: ["Devices"],
          security: [{ ApiKeyAuth: [] }, { JWTAuth: [] }],
          parameters: [
            {
              name: "deviceId",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          responses: {
            "200": {
              description: "Device retrieved successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Device" }
                }
              }
            },
            "404": { $ref: "#/components/responses/NotFound" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        },
        put: {
          summary: "Update device",
          description: "Update an existing device",
          tags: ["Devices"],
          security: [{ ApiKeyAuth: [] }, { JWTAuth: [] }],
          parameters: [
            {
              name: "deviceId",
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
            },
            "404": { $ref: "#/components/responses/NotFound" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        },
        delete: {
          summary: "Delete device",
          description: "Delete an existing device",
          tags: ["Devices"],
          security: [{ ApiKeyAuth: [] }, { JWTAuth: [] }],
          parameters: [
            {
              name: "deviceId",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          responses: {
            "200": {
              description: "Device deleted successfully"
            },
            "404": { $ref: "#/components/responses/NotFound" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        }
      },
      "/api/devices/{deviceId}/readings": {
        post: {
          summary: "Send device readings",
          description: "Submit sensor readings for a specific device",
          tags: ["Data"],
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: "deviceId",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeviceReading" }
              }
            }
          },
          responses: {
            "201": {
              description: "Readings submitted successfully"
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        },
        get: {
          summary: "Get device readings",
          description: "Retrieve historical readings for a device",
          tags: ["Data"],
          security: [{ ApiKeyAuth: [] }, { JWTAuth: [] }],
          parameters: [
            {
              name: "deviceId",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            },
            {
              name: "start_date",
              in: "query",
              schema: { type: "string", format: "date-time" }
            },
            {
              name: "end_date",
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
              description: "Device readings retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      readings: {
                        type: "array",
                        items: { $ref: "#/components/schemas/DeviceReading" }
                      },
                      total_count: { type: "integer" },
                      page_info: {
                        type: "object",
                        properties: {
                          has_next_page: { type: "boolean" },
                          cursor: { type: "string" }
                        }
                      }
                    }
                  }
                }
              }
            },
            "404": { $ref: "#/components/responses/NotFound" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        }
      },
      "/api/products": {
        get: {
          summary: "List product templates",
          description: "Retrieve all product templates for the organization",
          tags: ["Products"],
          security: [{ ApiKeyAuth: [] }, { JWTAuth: [] }],
          responses: {
            "200": {
              description: "Product templates retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" }
                      }
                    }
                  }
                }
              }
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        },
        post: {
          summary: "Create product template",
          description: "Create a new product template",
          tags: ["Products"],
          security: [{ JWTAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "device_type"],
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    device_type: { type: "string" },
                    data_schema: { type: "object" }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Product template created successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Product" }
                }
              }
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        }
      },
      "/api/endpoints": {
        get: {
          summary: "List endpoints",
          description: "Retrieve all configured endpoints for the organization",
          tags: ["Endpoints"],
          security: [{ ApiKeyAuth: [] }, { JWTAuth: [] }],
          responses: {
            "200": {
              description: "Endpoints retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      endpoints: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Endpoint" }
                      }
                    }
                  }
                }
              }
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        },
        post: {
          summary: "Create endpoint",
          description: "Create a new endpoint configuration",
          tags: ["Endpoints"],
          security: [{ JWTAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "type", "configuration"],
                  properties: {
                    name: { type: "string" },
                    type: { type: "string", enum: ["webhook", "email", "sms", "device_action"] },
                    configuration: { type: "object" },
                    enabled: { type: "boolean", default: true }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Endpoint created successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Endpoint" }
                }
              }
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        }
      },
      "/api/data-buckets/{bucketId}/data": {
        post: {
          summary: "Send data to bucket",
          description: "Submit data to a specific data bucket",
          tags: ["Data"],
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: "bucketId",
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
                  required: ["device_id", "data"],
                  properties: {
                    device_id: { type: "string", format: "uuid" },
                    timestamp: { type: "string", format: "date-time" },
                    data: { type: "object", additionalProperties: true }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Data submitted successfully"
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "404": { $ref: "#/components/responses/NotFound" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        }
      },
      "/api/organizations/{orgId}/users": {
        get: {
          summary: "List organization users",
          description: "Retrieve all users in the organization",
          tags: ["Organizations"],
          security: [{ JWTAuth: [] }],
          parameters: [
            {
              name: "orgId",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" }
            }
          ],
          responses: {
            "200": {
              description: "Organization users retrieved successfully"
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/Forbidden" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        }
      },
      "/api/user/profile": {
        get: {
          summary: "Get user profile",
          description: "Retrieve the current user's profile information",
          tags: ["User"],
          security: [{ JWTAuth: [] }],
          responses: {
            "200": {
              description: "User profile retrieved successfully"
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        },
        put: {
          summary: "Update user profile",
          description: "Update the current user's profile information",
          tags: ["User"],
          security: [{ JWTAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    display_name: { type: "string" },
                    email: { type: "string", format: "email" },
                    phone: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "User profile updated successfully"
            },
            "400": { $ref: "#/components/responses/BadRequest" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "500": { $ref: "#/components/responses/InternalError" }
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: "Bad request - invalid input parameters",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      },
      Unauthorized: {
        description: "Unauthorized - missing or invalid authentication",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      },
      Forbidden: {
        description: "Forbidden - insufficient permissions",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      },
      InternalError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" }
          }
        }
      }
    },
    tags: [
      {
        name: "Devices",
        description: "Device management operations"
      },
      {
        name: "Data",
        description: "Data ingestion and retrieval operations"
      },
      {
        name: "Products",
        description: "Product template management"
      },
      {
        name: "Endpoints", 
        description: "Endpoint configuration management"
      },
      {
        name: "Organizations",
        description: "Organization management operations"
      },
      {
        name: "User",
        description: "User profile operations"
      }
    ]
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
      <style>
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #1f2937; }
        .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
      </style>
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
          ],
          layout: "BaseLayout",
          deepLinking: true,
          showExtensions: true,
          showCommonExtensions: true,
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          docExpansion: "list",
          filter: true,
          supportedSubmitMethods: ['get', 'post', 'put', 'delete']
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
