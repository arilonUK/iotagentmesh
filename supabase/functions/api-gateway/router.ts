
interface RouteHandler {
  (req: Request, path: string, authHeader: string | null): Promise<Response>;
}

interface Routes {
  [key: string]: RouteHandler;
}

export class APIRouter {
  private routes: Routes = {};

  addRoute(pattern: string, handler: RouteHandler) {
    this.routes[pattern] = handler;
    console.log(`Route registered: ${pattern}`);
  }

  async route(req: Request, path: string, authHeader: string | null): Promise<Response> {
    console.log(`=== ROUTER START ===`);
    console.log(`Routing request to path: ${path}`);
    console.log(`Available routes:`, Object.keys(this.routes));
    
    // Try exact match first
    if (this.routes[path]) {
      console.log(`Found exact route match: ${path}`);
      return this.routes[path](req, path, authHeader);
    }

    // Try pattern matching for routes with wildcards
    for (const [pattern, handler] of Object.entries(this.routes)) {
      if (this.matchesPattern(path, pattern)) {
        console.log(`Found pattern match: '${pattern}' for path: '${path}'`);
        return handler(req, path, authHeader);
      }
    }

    console.log(`No route found for path: ${path}`);
    console.log(`Available routes:`, Object.keys(this.routes));
    
    return new Response(
      JSON.stringify({ 
        error: `Route not found: ${path}`,
        available_routes: Object.keys(this.routes),
        debug_info: {
          original_path: path,
          method: req.method,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  private matchesPattern(path: string, pattern: string): boolean {
    console.log(`Checking pattern match: '${path}' against '${pattern}'`);
    
    // Handle exact matches
    if (path === pattern) {
      console.log(`Exact match found`);
      return true;
    }
    
    // Handle wildcard patterns (e.g., /api/devices/*)
    if (pattern.endsWith('/*')) {
      const basePattern = pattern.slice(0, -2); // Remove /*
      const matches = path.startsWith(basePattern);
      console.log(`Wildcard check: '${path}' starts with '${basePattern}'? ${matches}`);
      return matches;
    }
    
    // Handle parameter patterns (e.g., /api/devices/:id)
    if (pattern.includes(':')) {
      const pathParts = path.split('/').filter(Boolean);
      const patternParts = pattern.split('/').filter(Boolean);
      
      if (pathParts.length !== patternParts.length) {
        console.log(`Parameter pattern length mismatch: ${pathParts.length} vs ${patternParts.length}`);
        return false;
      }
      
      for (let i = 0; i < patternParts.length; i++) {
        const patternPart = patternParts[i];
        const pathPart = pathParts[i];
        
        if (patternPart.startsWith(':')) {
          console.log(`Parameter match at position ${i}: '${pathPart}' matches parameter '${patternPart}'`);
          continue; // Parameter match
        } else if (patternPart !== pathPart) {
          console.log(`Static part mismatch at position ${i}: '${patternPart}' !== '${pathPart}'`);
          return false;
        }
      }
      console.log(`Parameter pattern fully matched`);
      return true;
    }
    
    console.log(`No pattern match found`);
    return false;
  }
}
