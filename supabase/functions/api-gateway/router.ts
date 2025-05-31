
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
    console.log(`Route added: ${pattern}`);
  }

  async route(req: Request, path: string, authHeader: string | null): Promise<Response> {
    console.log(`Routing request to path: ${path}`);
    console.log(`Available routes:`, Object.keys(this.routes));
    
    // Try exact match first
    if (this.routes[path]) {
      console.log(`Found exact route match for: ${path}`);
      return this.routes[path](req, path, authHeader);
    }

    // Try pattern matching for routes with parameters
    for (const [pattern, handler] of Object.entries(this.routes)) {
      if (this.matchesPattern(path, pattern)) {
        console.log(`Found pattern match: ${pattern} for path: ${path}`);
        return handler(req, path, authHeader);
      }
    }

    console.log(`No route found for path: ${path}`);
    console.log(`Available routes were:`, Object.keys(this.routes));
    return new Response(
      JSON.stringify({ 
        error: `Route not found: ${path}`,
        available_routes: Object.keys(this.routes),
        debug_info: {
          original_path: path,
          method: req.method
        }
      }),
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  private matchesPattern(path: string, pattern: string): boolean {
    console.log(`Checking if path '${path}' matches pattern '${pattern}'`);
    
    // Handle exact matches
    if (path === pattern) {
      console.log(`Exact match found`);
      return true;
    }
    
    // Handle wildcard patterns like /api/devices/*
    if (pattern.includes('*')) {
      const basePattern = pattern.replace('*', '');
      const matches = path.startsWith(basePattern);
      console.log(`Wildcard check: ${path} starts with ${basePattern}? ${matches}`);
      return matches;
    }
    
    // Handle parameter patterns like /api/devices/:id
    if (pattern.includes(':')) {
      const pathParts = path.split('/');
      const patternParts = pattern.split('/');
      
      if (pathParts.length !== patternParts.length) {
        console.log(`Parameter pattern length mismatch`);
        return false;
      }
      
      for (let i = 0; i < patternParts.length; i++) {
        const patternPart = patternParts[i];
        const pathPart = pathParts[i];
        
        if (patternPart.startsWith(':')) {
          continue; // Parameter match
        } else if (patternPart !== pathPart) {
          console.log(`Parameter pattern part mismatch: ${patternPart} !== ${pathPart}`);
          return false;
        }
      }
      console.log(`Parameter pattern matched`);
      return true;
    }
    
    console.log(`No pattern match found`);
    return false;
  }
}
