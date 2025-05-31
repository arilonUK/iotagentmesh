
export async function forwardToDevicesHandler(
  req: Request,
  path: string,
  authHeader: string | null
): Promise<Response> {
  console.log(`Forwarding to devices handler: ${path}`);
  console.log(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);

  try {
    const targetUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/api-devices${path}`;
    console.log(`Target URL: ${targetUrl}`);

    let body = null;
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      body = await req.text();
    }

    const targetRequest = new Request(targetUrl, {
      method: req.method,
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': req.headers.get('Content-Type') || 'application/json',
        'x-forwarded-path': path
      },
      body: body
    });

    console.log(`Making request to: ${targetUrl}`);
    const response = await fetch(targetRequest);
    console.log(`Response status: ${response.status}`);
    
    return response;
  } catch (error) {
    console.error('Error in forwardToDevicesHandler:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to forward request to devices service' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

