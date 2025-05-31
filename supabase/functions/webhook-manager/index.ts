
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookEndpoint {
  url: string;
  events: string[];
  secret?: string;
  enabled?: boolean;
  retry_count?: number;
  timeout_seconds?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Authenticate API key first
    const authResult = await supabaseClient.functions.invoke('api-auth', {
      headers: {
        Authorization: req.headers.get('Authorization') || ''
      }
    });

    if (authResult.error || !authResult.data?.success) {
      return new Response(
        JSON.stringify({ error: authResult.data?.error || 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { api_key_id, organization_id, scopes } = authResult.data;

    // Check permissions for webhook operations
    if (!scopes.includes('webhooks') && !scopes.includes('write')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions for webhook operations' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    const webhookId = pathParts[2]; // /webhooks/{id}

    // GET /webhooks - List webhook endpoints
    if (req.method === 'GET' && !webhookId) {
      const { data: webhooks, error } = await supabaseClient
        .from('webhook_endpoints')
        .select('*')
        .eq('organization_id', organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching webhooks:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch webhook endpoints' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ webhooks }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /webhooks/{id} - Get specific webhook
    if (req.method === 'GET' && webhookId) {
      const { data: webhook, error } = await supabaseClient
        .from('webhook_endpoints')
        .select('*')
        .eq('id', webhookId)
        .eq('organization_id', organization_id)
        .single();

      if (error || !webhook) {
        return new Response(
          JSON.stringify({ error: 'Webhook endpoint not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ webhook }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /webhooks - Create webhook endpoint
    if (req.method === 'POST' && !webhookId) {
      const webhookData: WebhookEndpoint = await req.json();

      if (!webhookData.url || !webhookData.events || webhookData.events.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: url and events' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate URL format
      try {
        new URL(webhookData.url);
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid webhook URL format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate secret if not provided
      const secret = webhookData.secret || crypto.randomUUID();

      const { data: webhook, error } = await supabaseClient
        .from('webhook_endpoints')
        .insert({
          organization_id: organization_id,
          url: webhookData.url,
          events: webhookData.events,
          secret: secret,
          enabled: webhookData.enabled !== false,
          retry_count: webhookData.retry_count || 3,
          timeout_seconds: webhookData.timeout_seconds || 30
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating webhook:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create webhook endpoint' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Track usage
      await supabaseClient.functions.invoke('usage-tracker', {
        body: {
          api_key_id,
          organization_id,
          endpoint: '/webhooks',
          method: 'POST',
          status_code: 201,
          response_time_ms: 0,
          ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For'),
          user_agent: req.headers.get('User-Agent')
        }
      });

      return new Response(
        JSON.stringify({ webhook, secret: secret }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /webhooks/{id} - Update webhook endpoint
    if (req.method === 'PUT' && webhookId) {
      const updateData: Partial<WebhookEndpoint> = await req.json();

      // Validate URL if provided
      if (updateData.url) {
        try {
          new URL(updateData.url);
        } catch {
          return new Response(
            JSON.stringify({ error: 'Invalid webhook URL format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      const { data: webhook, error } = await supabaseClient
        .from('webhook_endpoints')
        .update({
          url: updateData.url,
          events: updateData.events,
          enabled: updateData.enabled,
          retry_count: updateData.retry_count,
          timeout_seconds: updateData.timeout_seconds,
          updated_at: new Date().toISOString()
        })
        .eq('id', webhookId)
        .eq('organization_id', organization_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating webhook:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update webhook endpoint' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ webhook }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /webhooks/{id} - Delete webhook endpoint
    if (req.method === 'DELETE' && webhookId) {
      const { error } = await supabaseClient
        .from('webhook_endpoints')
        .delete()
        .eq('id', webhookId)
        .eq('organization_id', organization_id);

      if (error) {
        console.error('Error deleting webhook:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete webhook endpoint' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Webhook endpoint deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /webhooks/{id}/test - Test webhook endpoint
    if (req.method === 'POST' && webhookId && pathParts[3] === 'test') {
      const { data: webhook, error } = await supabaseClient
        .from('webhook_endpoints')
        .select('*')
        .eq('id', webhookId)
        .eq('organization_id', organization_id)
        .single();

      if (error || !webhook) {
        return new Response(
          JSON.stringify({ error: 'Webhook endpoint not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Dispatch test event
      const testEvent = {
        id: crypto.randomUUID(),
        type: 'webhook.test',
        created: new Date().toISOString(),
        data: {
          webhook_id: webhookId,
          message: 'This is a test webhook event'
        }
      };

      await supabaseClient.functions.invoke('webhook-dispatcher', {
        body: {
          webhook_id: webhookId,
          event: testEvent
        }
      });

      return new Response(
        JSON.stringify({ message: 'Test webhook dispatched', event: testEvent }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in webhook-manager function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
