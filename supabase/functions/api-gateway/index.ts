
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { findRoute, getAvailableEndpoints } from './router.ts'
import { logRequest } from './logging.ts'
import { authenticateRequest } from './auth.ts'
import { RequestResponseTransformer, defaultTransformationRules } from './transformer.ts'
import { createRateLimiter } from './rateLimiter.ts'
import { ApiVersionManager, defaultVersions } from './versioning.ts'
import { analyticsCollector } from './analytics.ts'
import { handleOpenApiDocs, handleApiDocs } from './handlers/docs.ts'
import { forwardToDevicesHandler } from './handlers/devices.ts'
import { forwardToProductsHandler } from './handlers/products.ts'
import { forwardToAlarmsHandler } from './handlers/alarms.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, api-version',
}

// Initialize enhanced features
const transformer = new RequestResponseTransformer();
defaultTransformationRules.forEach(rule => transformer.addRule(rule));

const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000,
  skipSuccessfulRequests: false
});

const versionManager = new ApiVersionManager();
defaultVersions.forEach(version => versionManager.addVersion(version));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    const url = new URL(req.url)
    let path = url.pathname

    console.log(`API Gateway: ${req.method} ${path}`)

    // Strip the /api-gateway prefix if it exists
    if (path.startsWith('/api-gateway')) {
      path = path.replace('/api-gateway', '')
      console.log(`Stripped prefix, new path: ${path}`)
    }

    // Extract API version
    const { version, path: versionedPath } = versionManager.extractVersion(req);
    path = versionedPath;
    console.log(`API Version: ${version}, Path: ${path}`);

    // Get authentication context
    const authHeader = req.headers.get('Authorization')
    const authContext = await authenticateRequest(authHeader);

    // Rate limiting check
    const rateLimitResult = await rateLimiter.checkRateLimit(req, authContext?.organization_id);
    if (!rateLimitResult.allowed) {
      const response = new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '900'
          }
        }
      );

      // Record rate limited request
      await rateLimiter.recordRequest(req, authContext?.organization_id, 429);
      
      return response;
    }

    // Handle documentation routes
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
      
      // Record 404 request
      await rateLimiter.recordRequest(req, authContext?.organization_id, 404);
      
      return new Response(
        JSON.stringify({ 
          error: 'Not Found',
          message: `No handler found for path: ${path}`,
          available_endpoints: getAvailableEndpoints(),
          version
        }),
        { 
          status: 404, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            ...versionManager.createVersionHeaders(version)
          }
        }
      )
    }

    // Transform request
    let body = null
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      const requestText = await req.text()
      body = requestText ? JSON.parse(requestText) : null
    }

    const { headers: transformedHeaders, body: transformedBody } = transformer.transformRequest(
      path, req.method, req.headers, body
    );

    let response: Response

    // Route to specific handlers
    if (route.handler === 'api-devices') {
      response = await forwardToDevicesHandler(req, path, authHeader)
    } else if (route.handler === 'api-products') {
      response = await forwardToProductsHandler(req, path, authHeader)
    } else if (route.handler === 'api-alarms') {
      response = await forwardToAlarmsHandler(req, path, authHeader)
    } else {
      // Generic forwarding for other handlers
      const targetUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${route.handler}${path}`
      console.log(`Forwarding to: ${targetUrl}`)

      const targetRequest = new Request(targetUrl, {
        method: req.method,
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': req.headers.get('Content-Type') || 'application/json',
          'x-forwarded-path': path,
          ...transformedHeaders
        },
        body: transformedBody ? JSON.stringify(transformedBody) : null
      })

      response = await fetch(targetRequest)
    }

    // Transform response
    const responseText = await response.text()
    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    const { headers: responseTransformHeaders, body: transformedResponseBody } = transformer.transformResponse(
      path, req.method, responseData
    );

    console.log(`Response from ${route.handler}: ${response.status}`)
    
    const processingTime = Date.now() - startTime;

    // Record analytics
    analyticsCollector.recordRequest({
      requestId,
      organizationId: authContext?.organization_id,
      apiKeyId: authContext?.api_key_id,
      endpoint: path,
      method: req.method,
      statusCode: response.status,
      responseTime: processingTime,
      requestSize: body ? JSON.stringify(body).length : 0,
      responseSize: responseText.length,
      userAgent: req.headers.get('User-Agent') || undefined,
      ipAddress: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || undefined,
      timestamp: new Date()
    });

    // Log the request
    await logRequest(path, req.method, response.status, req.headers, processingTime)

    // Record successful request for rate limiting
    await rateLimiter.recordRequest(req, authContext?.organization_id, response.status);

    return new Response(
      typeof transformedResponseBody === 'string' ? transformedResponseBody : JSON.stringify(transformedResponseBody),
      {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'X-Request-ID': requestId,
          'X-Processing-Time': processingTime.toString(),
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          ...versionManager.createVersionHeaders(version),
          ...responseTransformHeaders
        }
      }
    )

  } catch (error) {
    console.error('API Gateway error:', error)
    const processingTime = Date.now() - startTime
    
    // Record error analytics
    analyticsCollector.recordRequest({
      requestId,
      endpoint: url.pathname,
      method: req.method,
      statusCode: 500,
      responseTime: processingTime,
      userAgent: req.headers.get('User-Agent') || undefined,
      ipAddress: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || undefined,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });

    await logRequest(url.pathname, req.method, 500, req.headers, processingTime)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      }
    )
  }
})
