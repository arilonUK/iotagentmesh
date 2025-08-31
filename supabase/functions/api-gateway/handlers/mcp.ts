import { corsHeaders } from '../../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface OrganizationAccessResult {
  valid: boolean;
  reason?: string;
  requiredRole?: string;
}

async function validateOrganizationAccess(
  supabaseClient: any,
  organizationId: string,
  userId: string,
  userRole: string,
  method: string
): Promise<OrganizationAccessResult> {
  console.log(`Validating access for user ${userId} in org ${organizationId} with role ${userRole}`);
  
  // Define required permissions for different operations
  const writeOperations = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const isWriteOperation = writeOperations.includes(method);
  
  // Admin/Owner can perform all operations
  if (['admin', 'owner'].includes(userRole)) {
    return { valid: true };
  }
  
  // Members can only perform read operations on MCP resources
  if (userRole === 'member' && !isWriteOperation) {
    return { valid: true };
  }
  
  // Check organization status and user membership
  const { data: orgData, error: orgError } = await supabaseClient
    .from('organizations')
    .select('id, name')
    .eq('id', organizationId)
    .single();
    
  if (orgError || !orgData) {
    return {
      valid: false,
      reason: 'Organization not found or inaccessible'
    };
  }
  
  // For write operations, require admin/owner role
  if (isWriteOperation) {
    return {
      valid: false,
      reason: 'Write operations require admin or owner role',
      requiredRole: 'admin'
    };
  }
  
  return {
    valid: false,
    reason: 'Insufficient permissions for this operation',
    requiredRole: 'member'
  };
}

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

    // Enhanced body parsing with content-type validation
    let requestBody: Record<string, unknown> = {};
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          const bodyText = await req.text();
          if (bodyText.trim()) {
            const parsedBody = JSON.parse(bodyText);
            if (typeof parsedBody === 'object' && parsedBody !== null) {
              requestBody = parsedBody as Record<string, unknown>;
            } else {
              console.warn('Request body is not an object, ignoring');
            }
          }
        } catch (parseError) {
          console.error('Failed to parse JSON request body:', parseError);
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Invalid JSON in request body',
              details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else if (contentType && !contentType.includes('application/x-www-form-urlencoded')) {
        console.warn(`Unsupported content-type: ${contentType}`);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Unsupported content-type. Expected application/json',
            received: contentType
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Parsed request body keys: ${Object.keys(requestBody).join(', ')}`);

    // Enhanced organization scoping - validate access permissions
    const hasRequiredPermissions = await validateOrganizationAccess(
      supabaseClient,
      organizationId,
      user.id,
      orgMember.role,
      req.method
    );

    if (!hasRequiredPermissions.valid) {
      console.log(`Access denied: ${hasRequiredPermissions.reason}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: hasRequiredPermissions.reason,
          required_role: hasRequiredPermissions.requiredRole
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Merge request body with validated user context
    const forwardedBody = {
      ...requestBody,
      organizationId,
      userId: user.id,
      userRole: orgMember.role,
      requestMethod: req.method,
      timestamp: new Date().toISOString()
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