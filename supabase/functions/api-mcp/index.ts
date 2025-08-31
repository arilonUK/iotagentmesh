import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  console.log(`=== API-MCP FUNCTION START ===`);
  console.log(`Request method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the URL to extract path components
    const url = new URL(req.url);
    const pathParts = url.pathname.replace('/api-mcp', '').split('/').filter(Boolean);
    console.log(`Path parts: ${JSON.stringify(pathParts)}`);

    // Get request body
    let requestBody = null;
    const rawBody = await req.text();
    console.log(`Raw request body: ${rawBody}`);
    
    if (rawBody) {
      try {
        requestBody = JSON.parse(rawBody);
        console.log(`Parsed request body: ${JSON.stringify(requestBody)}`);
      } catch (e) {
        console.log(`Failed to parse request body as JSON: ${e.message}`);
        requestBody = rawBody;
      }
    }

    // Extract user context from request body if available
    const organizationId = requestBody?.organizationId;
    const userId = requestBody?.userId;
    const userRole = requestBody?.userRole;
    
    console.log(`Organization ID: ${organizationId}`);
    console.log(`User ID: ${userId}`);
    console.log(`User Role: ${userRole}`);

    // Route based on path
    if (pathParts.length === 0) {
      // Root MCP endpoint - return available MCP resources/capabilities
      return await handleMcpRoot(req, requestBody, organizationId);
    }
    
    const resource = pathParts[0];
    console.log(`MCP Resource: ${resource}`);
    
    switch (resource) {
      case 'tools':
        return await handleMcpTools(req, pathParts.slice(1), requestBody, organizationId);
      case 'resources':
        return await handleMcpResources(req, pathParts.slice(1), requestBody, organizationId);
      case 'prompts':
        return await handleMcpPrompts(req, pathParts.slice(1), requestBody, organizationId);
      case 'context':
        return await handleMcpContext(req, pathParts.slice(1), requestBody, organizationId, supabaseClient);
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unknown MCP resource: ${resource}`,
            available_resources: ['tools', 'resources', 'prompts', 'context']
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Error in API-MCP function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Handle root MCP endpoint - return server capabilities
async function handleMcpRoot(req: Request, body: any, organizationId: string): Promise<Response> {
  console.log('=== HANDLING MCP ROOT ===');
  
  const capabilities = {
    protocol: "mcp",
    version: "1.0",
    server: {
      name: "IoT Agent Mesh MCP Server",
      version: "1.0.0"
    },
    capabilities: {
      tools: {
        list: true,
        call: true
      },
      resources: {
        list: true,
        read: true
      },
      prompts: {
        list: true,
        get: true
      },
      context: {
        devices: true,
        analytics: true,
        real_time_data: true
      }
    },
    available_endpoints: [
      "/api/mcp/tools",
      "/api/mcp/resources", 
      "/api/mcp/prompts",
      "/api/mcp/context"
    ]
  };

  return new Response(
    JSON.stringify(capabilities),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Handle MCP tools - executable functions
async function handleMcpTools(req: Request, pathParts: string[], body: any, organizationId: string): Promise<Response> {
  console.log('=== HANDLING MCP TOOLS ===');
  console.log(`Tool path parts: ${JSON.stringify(pathParts)}`);

  if (req.method === 'GET' && pathParts.length === 0) {
    // List available tools
    const tools = [
      {
        name: "get_device_status",
        description: "Get the current status of a specific device",
        parameters: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description: "The ID of the device to check"
            }
          },
          required: ["device_id"]
        }
      },
      {
        name: "get_device_readings",
        description: "Get recent sensor readings from a device",
        parameters: {
          type: "object", 
          properties: {
            device_id: {
              type: "string",
              description: "The ID of the device"
            },
            reading_type: {
              type: "string",
              description: "Type of reading (temperature, humidity, etc.)"
            },
            limit: {
              type: "number",
              description: "Number of recent readings to retrieve"
            }
          },
          required: ["device_id"]
        }
      },
      {
        name: "trigger_endpoint",
        description: "Trigger an endpoint/automation",
        parameters: {
          type: "object",
          properties: {
            endpoint_id: {
              type: "string", 
              description: "The ID of the endpoint to trigger"
            },
            payload: {
              type: "object",
              description: "Optional payload data"
            }
          },
          required: ["endpoint_id"]
        }
      }
    ];
    
    return new Response(
      JSON.stringify({ tools }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (req.method === 'POST' && pathParts.length > 0) {
    // Execute a specific tool
    const toolName = pathParts[0];
    console.log(`Executing tool: ${toolName}`);
    
    switch (toolName) {
      case 'get_device_status':
        return await executeGetDeviceStatus(body, organizationId);
      case 'get_device_readings':
        return await executeGetDeviceReadings(body, organizationId);
      case 'trigger_endpoint':
        return await executeTriggerEndpoint(body, organizationId);
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown tool: ${toolName}` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Invalid tools request' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handle MCP resources - readable data sources
async function handleMcpResources(req: Request, pathParts: string[], body: any, organizationId: string): Promise<Response> {
  console.log('=== HANDLING MCP RESOURCES ===');
  
  if (req.method === 'GET' && pathParts.length === 0) {
    // List available resources
    const resources = [
      {
        uri: "device://list",
        name: "Device List",
        description: "List of all devices in the organization",
        mimeType: "application/json"
      },
      {
        uri: "analytics://dashboard",
        name: "Analytics Dashboard",
        description: "Organization analytics and metrics",
        mimeType: "application/json"
      },
      {
        uri: "endpoints://list", 
        name: "Endpoints List",
        description: "List of configured endpoints and automations",
        mimeType: "application/json"
      }
    ];
    
    return new Response(
      JSON.stringify({ resources }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Handle specific resource requests
  if (req.method === 'GET' && pathParts.length > 0) {
    const resourceType = pathParts[0];
    
    switch (resourceType) {
      case 'devices':
        return await getDevicesResource(organizationId);
      case 'analytics':
        return await getAnalyticsResource(organizationId);
      case 'endpoints':
        return await getEndpointsResource(organizationId);
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown resource: ${resourceType}` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Invalid resources request' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handle MCP prompts - templated conversation starters
async function handleMcpPrompts(req: Request, pathParts: string[], body: any, organizationId: string): Promise<Response> {
  console.log('=== HANDLING MCP PROMPTS ===');
  
  const prompts = [
    {
      name: "device_troubleshooting",
      description: "Help troubleshoot device issues",
      template: "I'm having issues with device {device_name}. The current status is {device_status} and the last reading was {last_reading}. What could be wrong?",
      parameters: ["device_name", "device_status", "last_reading"]
    },
    {
      name: "analytics_summary",
      description: "Generate analytics summary",
      template: "Please provide a summary of my IoT system based on these metrics: {metrics}. Focus on trends and potential issues.",
      parameters: ["metrics"]
    },
    {
      name: "endpoint_optimization",
      description: "Optimize endpoint configurations",
      template: "Review my endpoint configurations: {endpoints}. Suggest optimizations for better performance and reliability.",
      parameters: ["endpoints"]
    }
  ];
  
  return new Response(
    JSON.stringify({ prompts }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handle MCP context - real-time system context
async function handleMcpContext(req: Request, pathParts: string[], body: any, organizationId: string, supabaseClient: any): Promise<Response> {
  console.log('=== HANDLING MCP CONTEXT ===');
  
  try {
    // Get current system context
    const context = {
      timestamp: new Date().toISOString(),
      organization_id: organizationId,
      system_status: "operational",
      active_devices: 0,
      recent_alerts: [],
      performance_metrics: {}
    };

    // Get device count
    const { count: deviceCount } = await supabaseClient
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
    
    context.active_devices = deviceCount || 0;

    // Get recent alarms/alerts
    const { data: recentAlarms } = await supabaseClient
      .from('alarm_events')
      .select(`
        id,
        status,
        triggered_at,
        message,
        alarms (
          name,
          severity
        )
      `)
      .eq('status', 'active')
      .order('triggered_at', { ascending: false })
      .limit(5);

    context.recent_alerts = recentAlarms || [];

    return new Response(
      JSON.stringify({ context }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error getting MCP context:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to get system context',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Tool execution functions
async function executeGetDeviceStatus(body: any, organizationId: string): Promise<Response> {
  console.log('Executing get_device_status tool');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const deviceId = body?.device_id;
  if (!deviceId) {
    return new Response(
      JSON.stringify({ success: false, error: 'device_id parameter is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data: device, error } = await supabaseClient
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .eq('organization_id', organizationId)
      .single();

    if (error || !device) {
      return new Response(
        JSON.stringify({ success: false, error: 'Device not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        device: {
          id: device.id,
          name: device.name,
          type: device.type,
          status: device.status,
          last_active: device.last_active_at,
          description: device.description
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error getting device status:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to get device status' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function executeGetDeviceReadings(body: any, organizationId: string): Promise<Response> {
  console.log('Executing get_device_readings tool');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const deviceId = body?.device_id;
  const readingType = body?.reading_type;
  const limit = body?.limit || 10;

  if (!deviceId) {
    return new Response(
      JSON.stringify({ success: false, error: 'device_id parameter is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    let query = supabaseClient
      .from('device_readings')
      .select('*')
      .eq('device_id', deviceId)
      .eq('organization_id', organizationId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (readingType) {
      query = query.eq('reading_type', readingType);
    }

    const { data: readings, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        readings: readings || [],
        count: readings?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error getting device readings:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to get device readings' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function executeTriggerEndpoint(body: any, organizationId: string): Promise<Response> {
  console.log('Executing trigger_endpoint tool');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const endpointId = body?.endpoint_id;
  const payload = body?.payload || {};

  if (!endpointId) {
    return new Response(
      JSON.stringify({ success: false, error: 'endpoint_id parameter is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Forward to trigger-endpoint function
    const { data, error } = await supabaseClient.functions.invoke('trigger-endpoint', {
      body: {
        endpoint_id: endpointId,
        payload,
        organization_id: organizationId
      }
    });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to trigger endpoint', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error triggering endpoint:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to trigger endpoint' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Resource getter functions
async function getDevicesResource(organizationId: string): Promise<Response> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { data: devices, error } = await supabaseClient
      .from('devices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        resource: 'devices',
        data: devices || [] 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error getting devices resource:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to get devices resource' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getAnalyticsResource(organizationId: string): Promise<Response> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get basic analytics using the database function
    const { data: summary, error } = await supabaseClient
      .rpc('get_organization_summary', { p_organization_id: organizationId });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        resource: 'analytics',
        data: summary || {} 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error getting analytics resource:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to get analytics resource' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getEndpointsResource(organizationId: string): Promise<Response> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { data: endpoints, error } = await supabaseClient
      .from('endpoints')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        resource: 'endpoints',
        data: endpoints || [] 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error getting endpoints resource:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to get endpoints resource' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}