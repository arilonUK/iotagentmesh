
import { handleOpenApiDocs, handleApiDocs } from './handlers/docs.ts';
import { handleDevices } from './handlers/devices.ts';
import { handleEndpoints } from './handlers/endpoints.ts';
import { handleProducts } from './handlers/products.ts';
import { handleProfiles } from './handlers/profiles.ts';
import { RouteHandler } from './types.ts';
import { handleApiKeys } from './handlers/keys.ts';

export function createRouter() {
  const routes = new Map<string, RouteHandler>();
  
  // Documentation routes
  routes.set('/api/openapi.json', handleOpenApiDocs);
  routes.set('/api/docs', handleApiDocs);
  
  // API routes with their handlers
  routes.set('/api/devices', handleDevices);
  routes.set('/api/devices/*', handleDevices);
  routes.set('/api/endpoints', handleEndpoints);
  routes.set('/api/endpoints/*', handleEndpoints);
  routes.set('/api/products', handleProducts);
  routes.set('/api/products/*', handleProducts);
  routes.set('/api/profiles', handleProfiles);
  routes.set('/api/profiles/*', handleProfiles);
  
  // Add API keys routes
  routes.set('/api/keys', handleApiKeys);
  routes.set('/api/keys/*', handleApiKeys);

  return {
    async handle(req: Request, path: string): Promise<Response> {
      console.log(`=== ROUTER START ===`);
      console.log(`Routing request to path: ${path}`);
      
      // Log all available routes
      const availableRoutes = Array.from(routes.keys());
      console.log(`Available routes: ${JSON.stringify(availableRoutes, null, 2)}`);
      
      // Check for exact match first
      for (const [routePath, handler] of routes.entries()) {
        console.log(`Checking wildcard pattern: '${path}' against '${routePath}'`);
        
        if (routePath === path) {
          console.log(`Exact match found for: ${path}`);
          console.log(`Route registered: ${routePath}`);
          const response = await handler(req, path);
          console.log(`Router response status: ${response.status}`);
          console.log(`=== ROUTER END ===`);
          return response;
        }
        
        // Check for wildcard patterns
        if (routePath.endsWith('/*')) {
          const baseRoute = routePath.slice(0, -2); // Remove /*
          console.log(`Wildcard check: '${path}' starts with '${baseRoute}'? ${path.startsWith(baseRoute)}`);
          if (path.startsWith(baseRoute)) {
            console.log(`Wildcard match found for: ${path} -> ${routePath}`);
            console.log(`Route registered: ${routePath}`);
            const response = await handler(req, path);
            console.log(`Router response status: ${response.status}`);
            console.log(`=== ROUTER END ===`);
            return response;
          }
        } else {
          console.log(`Route registered: ${routePath}`);
        }
      }
      
      console.log(`No route found for path: ${path}`);
      console.log(`Available routes: ${JSON.stringify(availableRoutes, null, 2)}`);
      console.log(`Router response status: 404`);
      console.log(`=== ROUTER END ===`);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Route not found',
          path,
          available_routes: availableRoutes
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  };
}
