
export async function forwardToProfilesHandler(
  req: Request,
  pathParams: Record<string, string>,
  authHeader: string | null
): Promise<Response> {
  console.log(`=== PROFILES HANDLER START ===`);
  console.log(`Auth header: ${authHeader ? 'Present' : 'Missing'}`);
  
  try {
    const baseUrl = Deno.env.get('SUPABASE_URL');
    if (!baseUrl) {
      throw new Error('SUPABASE_URL environment variable not set');
    }
    
    const url = new URL(req.url);
    let profilePath = url.pathname;
    if (profilePath.includes('/api-gateway')) {
      profilePath = profilePath.replace('/api-gateway', '');
    }
    
    const targetUrl = `${baseUrl}/functions/v1/api-profiles${profilePath.replace('/api/profiles', '')}`;
    
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
    console.log(`=== PROFILES HANDLER END ===`);
    
    return new Response(responseText, {
      status: response.status,
      headers: new Headers(response.headers)
    });
    
  } catch (error) {
    console.error('Error in forwardToProfilesHandler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to forward request to profiles service',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
