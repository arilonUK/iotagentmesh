
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
    return new Response(
      JSON.stringify({ error: `Route not found: ${path}` }),
      { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  private matchesPattern(path: string, pattern: string): boolean {
    // Handle exact matches
    if (path === pattern) return true;
    
    // Handle wildcard patterns like /api/devices/*
    if (pattern.includes('*')) {
      const basePattern = pattern.replace('*', '');
      return path.startsWith(basePattern);
    }
    
    // Handle parameter patterns like /api/devices/:id
    if (pattern.includes(':')) {
      const pathParts = path.split('/');
      const patternParts = pattern.split('/');
      
      if (pathParts.length !== patternParts.length) return false;
      
      for (let i = 0; i < patternParts.length; i++) {
        const patternPart = patternParts[i];
        const pathPart = pathParts[i];
        
        if (patternPart.startsWith(':')) {
          continue; // Parameter match
        } else if (patternPart !== pathPart) {
          return false;
        }
      }
      return true;
    }
    
    return false;
  }
}

