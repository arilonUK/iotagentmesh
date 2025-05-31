
export async function forwardToDevicesHandler(
  req: Request,
  path: string,
  authHeader: string | null
): Promise<Response> {
  console.log(`=== DEVICES HANDLER ===`);
  console.log(`Forwarding to devices handler: ${path}`);
  console.log(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);
  console.log(`Request method: ${req.method}`);

  try {
    // Build the target URL - forward the exact path to the devices service
    const targetUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/api-devices${path}`;
    console.log(`Target URL: ${targetUrl}`);

    let body = null;
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      body = await req.text();
      console.log(`Request body: ${body}`);
    }

    const headers: Record<string, string> = {
      'Content-Type': req.headers.get('Content-Type') || 'application/json',
      'x-forwarded-path': path
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log(`Request headers:`, headers);

    const targetRequest = new Request(targetUrl, {
      method: req.method,
      headers,
      body: body
    });

    console.log(`Making request to: ${targetUrl}`);
    const response = await fetch(targetRequest);
    console.log(`Response status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`Response body: ${responseText}`);
    
    return new Response(responseText, {
      status: response.status,
      headers: response.headers
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
