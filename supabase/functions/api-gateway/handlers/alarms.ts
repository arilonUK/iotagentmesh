
export async function forwardToAlarmsHandler(
  req: Request,
  path: string,
  authHeader: string | null
): Promise<Response> {
  console.log(`Forwarding to alarms handler: ${path}`);

  try {
    const targetUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/api-alarms${path}`;
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

    const response = await fetch(targetRequest);
    return response;
  } catch (error) {
    console.error('Error in forwardToAlarmsHandler:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to forward request to alarms service' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

