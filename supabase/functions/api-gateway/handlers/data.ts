import { corsHeaders } from '../../_shared/cors.ts';
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { Database } from '../../_shared/database.types.ts';

export async function handleData(req: Request, path: string): Promise<Response> {
  const supabaseClient: SupabaseClient<Database> = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const segments = path.replace('/api/data', '').split('/').filter(Boolean);

    // Authentication and organization logic copied from devices handler
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: orgMember, error: orgError } = await supabaseClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (orgError || !orgMember) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not associated with any organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const organizationId = orgMember.organization_id;
    void organizationId; // currently unused but retained for parity

    const body: Record<string, unknown> | undefined = req.method === 'GET' ? undefined : await req.json();

    const { data, error: invokeError, status } = await supabaseClient.functions.invoke('api-data', {
      body,
      headers: { Authorization: authHeader },
      method: req.method,
      path: segments.join('/'),
      query: Object.fromEntries(url.searchParams.entries()),
    });

    if (invokeError) {
      return new Response(
        JSON.stringify({ success: false, error: invokeError.message ?? 'Failed to process data request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: status ?? 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in data handler:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
