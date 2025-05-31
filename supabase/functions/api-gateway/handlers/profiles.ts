
export async function forwardToProfilesHandler(
  req: Request,
  path: string,
  authHeader: string | null
): Promise<Response> {
  console.log(`=== PROFILES HANDLER START ===`);
  console.log(`Incoming path: ${path}`);
  console.log(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);
  console.log(`Request method: ${req.method}`);

  try {
    // Build the target URL - forward to the api-profiles function
    const baseUrl = Deno.env.get('SUPABASE_URL');
    if (!baseUrl) {
      throw new Error('SUPABASE_URL environment variable not set');
    }
    
    // Forward the path directly to api-profiles
    const targetUrl = `${baseUrl}/functions/v1/api-profiles${path}`;
    console.log(`Target URL: ${targetUrl}`);

    // Get request body if present
    let body = null;
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      body = await req.text();
      console.log(`Request body: ${body || 'empty'}`);
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': req.headers.get('Content-Type') || 'application/json',
      'x-forwarded-path': path,
      'x-forwarded-method': req.method
    };

    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log(`Request headers:`, headers);

    // Make the forwarded request
    const targetRequest = new Request(targetUrl, {
      method: req.method,
      headers,
      body: body
    });

    console.log(`Making forwarded request...`);
    const response = await fetch(targetRequest);
    console.log(`Forwarded response status: ${response.status}`);
    
    // Get response body
    const responseText = await response.text();
    console.log(`Forwarded response body: ${responseText}`);
    
    // Return the response with original headers
    const responseHeaders = new Headers(response.headers);
    
    console.log(`=== PROFILES HANDLER END ===`);
    
    return new Response(responseText, {
      status: response.status,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error in forwardToProfilesHandler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to forward request to profiles service',
        details: error.message,
        path: path,
        method: req.method
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
