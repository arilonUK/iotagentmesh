
export async function forwardToDevicesHandler(
  req: Request,
  pathParams: Record<string, string>
): Promise<Response> {
  console.log(`=== DEVICES HANDLER START ===`);
  console.log(`Request method: ${req.method}`);
  console.log(`Path params:`, pathParams);

  try {
    // Get auth header from the original request
    const authHeader = req.headers.get('Authorization');
    console.log(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);

    // Build the target URL - forward to the api-devices function
    const baseUrl = Deno.env.get('SUPABASE_URL');
    if (!baseUrl) {
      throw new Error('SUPABASE_URL environment variable not set');
    }
    
    // Extract the path after /api/devices
    const url = new URL(req.url);
    const originalPath = url.pathname;
    console.log(`Original path: ${originalPath}`);
    
    // Remove api-gateway prefix if present
    let devicePath = originalPath;
    if (devicePath.includes('/api-gateway')) {
      devicePath = devicePath.replace('/api-gateway', '');
    }
    
    // The target should be the api-devices function with the remaining path
    const targetUrl = `${baseUrl}/functions/v1/api-devices${devicePath.replace('/api/devices', '')}`;
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
    
    console.log(`=== DEVICES HANDLER END ===`);
    
    return new Response(responseText, {
      status: response.status,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error in forwardToDevicesHandler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to forward request to devices service',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
