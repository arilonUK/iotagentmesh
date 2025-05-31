

import { forwardToDevicesHandler } from './handlers/devices.ts';
import { forwardToAlarmsHandler } from './handlers/alarms.ts';
import { forwardToEndpointsHandler } from './handlers/endpoints.ts';
import { forwardToProductsHandler } from './handlers/products.ts';
import { forwardToProfilesHandler } from './handlers/profiles.ts';
import { handleOpenApiDocs, handleApiDocs } from './handlers/docs.ts';

export class Router {
  private routes: Map<string, (request: Request, pathParams: Record<string, string>) => Promise<Response>> = new Map();

  constructor() {
    this.registerRoutes();
  }

  private registerRoutes() {
    // Documentation routes - register these first for exact matching
    this.routes.set('/api/openapi.json', handleOpenApiDocs);
    this.routes.set('/api/docs', handleApiDocs);
    console.log('Route registered: /api/openapi.json');
    console.log('Route registered: /api/docs');

    // Device routes
    this.routes.set('/api/devices', forwardToDevicesHandler);
    this.routes.set('/api/devices/*', forwardToDevicesHandler);
    console.log('Route registered: /api/devices');
    console.log('Route registered: /api/devices/*');

    // Alarm routes
    this.routes.set('/api/alarms', forwardToAlarmsHandler);
    this.routes.set('/api/alarms/*', forwardToAlarmsHandler);
    console.log('Route registered: /api/alarms');
    console.log('Route registered: /api/alarms/*');

    // Endpoint routes
    this.routes.set('/api/endpoints', forwardToEndpointsHandler);
    this.routes.set('/api/endpoints/*', forwardToEndpointsHandler);
    console.log('Route registered: /api/endpoints');
    console.log('Route registered: /api/endpoints/*');

    // Product routes
    this.routes.set('/api/products', forwardToProductsHandler);
    this.routes.set('/api/products/*', forwardToProductsHandler);
    console.log('Route registered: /api/products');
    console.log('Route registered: /api/products/*');

    // Profile routes
    this.routes.set('/api/profiles', forwardToProfilesHandler);
    this.routes.set('/api/profiles/*', forwardToProfilesHandler);
    console.log('Route registered: /api/profiles');
    console.log('Route registered: /api/profiles/*');
  }

  async route(request: Request, pathname: string): Promise<Response> {
    console.log('=== ROUTER START ===');
    console.log('Routing request to path:', pathname);
    console.log('Available routes:', Array.from(this.routes.keys()));

    // Get auth header
    const authHeader = request.headers.get('Authorization');

    // Check for exact matches first - prioritize documentation routes
    const exactMatch = this.routes.get(pathname);
    if (exactMatch) {
      console.log('Exact match found for:', pathname);
      // For documentation routes, call directly without auth header
      if (pathname === '/api/openapi.json' || pathname === '/api/docs') {
        const response = await exactMatch(request, {});
        console.log('Router response status:', response.status);
        console.log('=== ROUTER END ===');
        return response;
      } else {
        // For other handlers, pass request and auth header
        const response = await exactMatch(request, {}, authHeader);
        console.log('Router response status:', response.status);
        console.log('=== ROUTER END ===');
        return response;
      }
    }

    // Handle wildcard patterns
    for (const [pattern, handler] of this.routes.entries()) {
      console.log(`Checking wildcard pattern: '${pathname}' against '${pattern}'`);
      
      if (pattern.endsWith('/*')) {
        const basePattern = pattern.slice(0, -2);
        console.log(`Wildcard check: '${pathname}' starts with '${basePattern}'?`, pathname.startsWith(basePattern));
        
        if (pathname.startsWith(basePattern)) {
          console.log('Wildcard match found');
          const pathSegments = pathname.split('/');
          const patternSegments = basePattern.split('/');
          
          // Extract path parameters
          const pathParams: Record<string, string> = {};
          for (let i = patternSegments.length; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            if (segment) {
              pathParams[`param${i - patternSegments.length}`] = segment;
            }
          }
          
          const response = await handler(request, pathParams, authHeader);
          console.log('Router response status:', response.status);
          console.log('=== ROUTER END ===');
          return response;
        }
      }
    }

    console.log('No route found for path:', pathname);
    console.log('Available routes:', Array.from(this.routes.keys()));
    console.log('Router response status: 404');
    console.log('=== ROUTER END ===');

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Route not found',
      path: pathname,
      available_routes: Array.from(this.routes.keys())
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }
}
