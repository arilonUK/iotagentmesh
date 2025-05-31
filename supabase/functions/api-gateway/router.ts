
import { handleDeviceRoutes } from './handlers/devices.ts';
import { handleAlarmRoutes } from './handlers/alarms.ts';
import { handleEndpointRoutes } from './handlers/endpoints.ts';
import { handleProductRoutes } from './handlers/products.ts';
import { handleProfileRoutes } from './handlers/profiles.ts';
import { handleOpenApiDocs, handleApiDocs } from './handlers/docs.ts';

export class Router {
  private routes: Map<string, (request: Request, pathParams: Record<string, string>) => Promise<Response>> = new Map();

  constructor() {
    this.registerRoutes();
  }

  private registerRoutes() {
    // Device routes
    this.routes.set('/api/devices', handleDeviceRoutes);
    this.routes.set('/api/devices/*', handleDeviceRoutes);
    console.log('Route registered: /api/devices');
    console.log('Route registered: /api/devices/*');

    // Alarm routes
    this.routes.set('/api/alarms', handleAlarmRoutes);
    this.routes.set('/api/alarms/*', handleAlarmRoutes);
    console.log('Route registered: /api/alarms');
    console.log('Route registered: /api/alarms/*');

    // Endpoint routes
    this.routes.set('/api/endpoints', handleEndpointRoutes);
    this.routes.set('/api/endpoints/*', handleEndpointRoutes);
    console.log('Route registered: /api/endpoints');
    console.log('Route registered: /api/endpoints/*');

    // Product routes
    this.routes.set('/api/products', handleProductRoutes);
    this.routes.set('/api/products/*', handleProductRoutes);
    console.log('Route registered: /api/products');
    console.log('Route registered: /api/products/*');

    // Profile routes
    this.routes.set('/api/profiles', handleProfileRoutes);
    this.routes.set('/api/profiles/*', handleProfileRoutes);
    console.log('Route registered: /api/profiles');
    console.log('Route registered: /api/profiles/*');

    // Documentation routes
    this.routes.set('/api/openapi.json', handleOpenApiDocs);
    this.routes.set('/api/docs', handleApiDocs);
    console.log('Route registered: /api/openapi.json');
    console.log('Route registered: /api/docs');
  }

  async route(request: Request, pathname: string): Promise<Response> {
    console.log('=== ROUTER START ===');
    console.log('Routing request to path:', pathname);
    console.log('Available routes:', Array.from(this.routes.keys()));

    // Check for exact matches first
    for (const [pattern, handler] of this.routes.entries()) {
      console.log(`Checking pattern match: '${pathname}' against '${pattern}'`);
      
      if (pattern === pathname) {
        console.log('Exact match found');
        const response = await handler(request, {});
        console.log('Router response status:', response.status);
        console.log('=== ROUTER END ===');
        return response;
      }

      // Handle wildcard patterns
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
          
          const response = await handler(request, pathParams);
          console.log('Router response status:', response.status);
          console.log('=== ROUTER END ===');
          return response;
        }
      }
      
      console.log('No pattern match found');
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
