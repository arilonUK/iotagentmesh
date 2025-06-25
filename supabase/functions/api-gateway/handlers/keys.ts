
import { corsHeaders } from '../../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function handleApiKeys(req: Request, path: string): Promise<Response> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const segments = path.replace('/api/keys', '').split('/').filter(Boolean);
    const method = req.method;

    // Get auth header and verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's organization
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

    // Route handling
    if (method === 'GET' && segments.length === 0) {
      // GET /api/keys - List API keys
      const { data: apiKeys, error } = await supabaseClient
        .from('api_keys')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch API keys' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, api_keys: apiKeys }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'POST' && segments.length === 0) {
      // POST /api/keys - Create new API key
      const requestData = await req.json();
      
      // Validate request data
      if (!requestData.name || !requestData.scopes || requestData.scopes.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields: name and scopes' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user has permission to create API keys
      if (!['admin', 'owner'].includes(orgMember.role)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Insufficient permissions to create API keys' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a secure API key
      const keyId = crypto.randomUUID().replace(/-/g, '');
      const fullKey = `iot_${keyId}`;
      const prefix = `iot_${keyId.substring(0, 8)}...`;
      
      // Hash the key for storage
      const encoder = new TextEncoder();
      const data = encoder.encode(fullKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Calculate expiration date
      let expiresAt = null;
      if (requestData.expiration && requestData.expiration !== 'never') {
        const months = parseInt(requestData.expiration);
        if (!isNaN(months)) {
          const expirationDate = new Date();
          expirationDate.setMonth(expirationDate.getMonth() + months);
          expiresAt = expirationDate.toISOString();
        }
      }

      // Insert API key into database
      const { data: apiKey, error: insertError } = await supabaseClient
        .from('api_keys')
        .insert({
          organization_id: organizationId,
          name: requestData.name,
          key_hash: keyHash,
          prefix,
          scopes: requestData.scopes,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting API key:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create API key' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          api_key: apiKey,
          full_key: fullKey
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'POST' && segments.length === 2 && segments[1] === 'refresh') {
      // POST /api/keys/:id/refresh - Refresh API key
      const keyId = segments[0];

      // Check if user has permission to refresh API keys
      if (!['admin', 'owner'].includes(orgMember.role)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Insufficient permissions to refresh API keys' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the existing API key to preserve settings
      const { data: existingKey, error: fetchError } = await supabaseClient
        .from('api_keys')
        .select('*')
        .eq('id', keyId)
        .eq('organization_id', organizationId)
        .single();

      if (fetchError || !existingKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'API key not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a new secure API key
      const newKeyId = crypto.randomUUID().replace(/-/g, '');
      const fullKey = `iot_${newKeyId}`;
      const prefix = `iot_${newKeyId.substring(0, 8)}...`;

      // Hash the new key
      const encoder = new TextEncoder();
      const data = encoder.encode(fullKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Calculate new expiration date (extend by same period as original)
      let newExpiresAt = null;
      if (existingKey.expires_at) {
        const originalExpiration = new Date(existingKey.expires_at);
        const createdAt = new Date(existingKey.created_at);
        const monthsDiff = (originalExpiration.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44); // approximate months
        
        const newExpirationDate = new Date();
        newExpirationDate.setMonth(newExpirationDate.getMonth() + Math.round(monthsDiff));
        newExpiresAt = newExpirationDate.toISOString();
      }

      // Update the API key with new values
      const { data: refreshedKey, error: updateError } = await supabaseClient
        .from('api_keys')
        .update({
          key_hash: keyHash,
          prefix,
          expires_at: newExpiresAt,
          last_used: null, // Reset last used
          updated_at: new Date().toISOString()
        })
        .eq('id', keyId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (updateError) {
        console.error('Error refreshing API key:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to refresh API key' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          api_key: refreshedKey,
          full_key: fullKey
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'PUT' && segments.length === 1) {
      // PUT /api/keys/:id - Update API key
      const keyId = segments[0];
      const updates = await req.json();

      const { data: updatedKey, error } = await supabaseClient
        .from('api_keys')
        .update(updates)
        .eq('id', keyId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update API key' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, api_key: updatedKey }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'DELETE' && segments.length === 1) {
      // DELETE /api/keys/:id - Delete API key
      const keyId = segments[0];

      const { error } = await supabaseClient
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('organization_id', organizationId);

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to delete API key' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'GET' && segments[0] === 'usage') {
      // GET /api/keys/usage - Get API usage statistics
      const limit = parseInt(url.searchParams.get('limit') || '100');
      
      const { data: usage, error } = await supabaseClient
        .from('api_usage')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch API usage' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, usage }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in API keys handler:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
