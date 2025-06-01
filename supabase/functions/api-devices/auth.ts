
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface AuthResult {
  organization_id: string;
  user_id: string | null;
}

export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const authHeader = req.headers.get('Authorization') || '';
  console.log('Auth header received:', authHeader ? 'Present' : 'Missing');

  let organization_id: string;
  let user_id: string | null = null;

  // Check if this is a JWT token (user session) or API key
  if (authHeader.startsWith('Bearer ey')) {
    // This looks like a JWT token - validate with Supabase auth
    console.log('Processing JWT token authentication');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('JWT authentication failed:', authError);
      throw new Error(`Authentication failed: ${authError?.message}`);
    }

    user_id = user.id;
    console.log('User authenticated:', user_id);

    // Get user's default organization
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('default_organization_id')
      .eq('id', user_id)
      .single();

    if (profileError || !profile?.default_organization_id) {
      console.error('Failed to get user organization:', profileError);
      throw new Error(`No organization found for user: ${profileError?.message}`);
    }

    organization_id = profile.default_organization_id;
    console.log('Using organization:', organization_id);

  } else {
    // Try API key authentication
    console.log('Processing API key authentication');
    
    try {
      const authResult = await supabaseClient.functions.invoke('api-auth', {
        headers: {
          Authorization: authHeader
        }
      });

      if (authResult.error || !authResult.data?.success) {
        console.error('API key authentication failed:', authResult.error);
        throw new Error(authResult.data?.error || 'Authentication failed');
      }

      organization_id = authResult.data.organization_id;
      console.log('API key authenticated for organization:', organization_id);

      // Check if user has device permissions
      const scopes = authResult.data.scopes || [];
      if (!scopes.includes('devices') && !scopes.includes('read') && !scopes.includes('write')) {
        throw new Error('Insufficient permissions for device operations');
      }
    } catch (apiAuthError) {
      console.error('API auth function error:', apiAuthError);
      throw new Error(`Authentication service unavailable: ${apiAuthError.message}`);
    }
  }

  return { organization_id, user_id };
}
