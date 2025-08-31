import { corsHeaders } from '../../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleMcp(req: Request, path: string): Promise<Response> {
  console.log(`=== MCP HANDLER START ===`);
  console.log(`Processing MCP request: ${req.method} ${path}`);
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const segments = path.replace('/api/mcp', '').split('/').filter(Boolean);
    console.log(`MCP path segments: ${JSON.stringify(segments)}`);

    // Authentication and organization logic
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Get user's organization
    const { data: orgMember, error: orgError } = await supabaseClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (orgError || !orgMember) {
      console.log('Organization membership error:', orgError);
      return new Response(
        JSON.stringify({ success: false, error: 'User not associated with any organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const organizationId = orgMember.organization_id;
    console.log(`Organization: ${organizationId}, Role: ${orgMember.role}`);

    // Get request body safely if applicable
    let body: unknown = undefined;
    if (req.method !== 'GET') {
      try {
        const bodyText = await req.text();
        if (bodyText.trim()) {
          body = JSON.parse(bodyText);
        }
      } catch (parseError) {
        console.log('Failed to parse request body as JSON, treating as text');
        body = bodyText;
      }
    }
    console.log(`Request body: ${body ? JSON.stringify(body) : 'none'}`);

    // Merge body with user context for the forwarded request
    const forwardedBody = {
      ...(typeof body === 'object' && body !== null ? body : {}),
      organizationId,
      userId: user.id,
      userRole: orgMember.role
    };

    // Forward to api-mcp function
    console.log('Forwarding to api-mcp function...');
    const { data, error: invokeError, status } = await supabaseClient.functions.invoke('api-mcp', {
      body: forwardedBody,
      headers: { 
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      method: req.method,
      path: segments.join('/'),
      query: Object.fromEntries(url.searchParams.entries()),
    });

    if (invokeError) {
      console.error('MCP function invoke error:', invokeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: invokeError.message ?? 'Failed to process MCP request',
          details: invokeError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`MCP function response status: ${status}`);
    console.log(`=== MCP HANDLER END ===`);
    
    return new Response(
      JSON.stringify(data),
      { status: status ?? 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in MCP handler:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}