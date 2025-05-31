
export interface RouteHandler {
  pattern: RegExp;
  handler: string;
}

export const routes: RouteHandler[] = [
  { pattern: /^\/api\/devices/, handler: 'api-devices' },
  { pattern: /^\/api\/products/, handler: 'api-products' },
  { pattern: /^\/api\/data/, handler: 'api-data' },
  { pattern: /^\/api\/keys/, handler: 'api-key-management' },
  { pattern: /^\/api\/alarms/, handler: 'api-alarms' },
  { pattern: /^\/api\/endpoints/, handler: 'api-endpoints' },
  { pattern: /^\/api\/profiles/, handler: 'api-profiles' },
  { pattern: /^\/api\/files/, handler: 'api-files' },
  { pattern: /^\/api\/organizations/, handler: 'api-organizations' },
  { pattern: /^\/api\/openapi\.json$/, handler: 'openapi-docs' },
  { pattern: /^\/api\/docs/, handler: 'api-docs' }
];

export function findRoute(path: string): RouteHandler | undefined {
  return routes.find(r => r.pattern.test(path));
}

export function getAvailableEndpoints(): string[] {
  return [
    '/api/devices',
    '/api/products', 
    '/api/data',
    '/api/keys',
    '/api/alarms',
    '/api/endpoints',
    '/api/profiles',
    '/api/files',
    '/api/organizations',
    '/api/openapi.json',
    '/api/docs'
  ];
}
