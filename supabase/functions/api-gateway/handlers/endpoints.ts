
export async function forwardToEndpointsHandler(
  req: Request,
  pathParams: Record<string, string>,
  authHeader: string | null
): Promise<Response> {
  console.log(`=== ENDPOINTS HANDLER START ===`);
  console.log(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);
  
  try {
    const baseUrl = Deno.env.get('SUPABASE_URL');
    if (!baseUrl) {
      throw new Error('SUPABASE_URL environment variable not set');
    }
    
    const url = new URL(req.url);
    let endpointPath = url.pathname;
    if (endpointPath.includes('/api-gateway')) {
      endpointPath = endpointPath.replace('/api-gateway', '');
    }
    
    const targetUrl = `${baseUrl}/functions/v1/api-endpoints${endpointPath.replace('/api/endpoints', '')}`;
    
    let body = null;
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      body = await req.text();
    }

    const headers: Record<string, string> = {
      'Content-Type': req.headers.get('Content-Type') || 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(new Request(targetUrl, {
      method: req.method,
      headers,
      body: body
    }));
    
    const responseText = await response.text();
    console.log(`=== ENDPOINTS HANDLER END ===`);
    
    return new Response(responseText, {
      status: response.status,
      headers: new Headers(response.headers)
    });
    
  } catch (error) {
    console.error('Error in forwardToEndpointsHandler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to forward request to endpoints service',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
