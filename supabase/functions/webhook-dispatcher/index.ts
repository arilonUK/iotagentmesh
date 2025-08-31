
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookEvent {
  id: string;
  type: string;
  created: string;
  data: Record<string, unknown>;
}

interface WebhookDelivery {
  webhook_id: string;
  event: WebhookEvent;
  attempt?: number;
  max_retries?: number;
}

// Generate HMAC signature for webhook verification
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256=${hashHex}`;
}

// Calculate exponential backoff delay
function calculateDelay(attempt: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 300000; // 5 minutes
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  return delay + Math.random() * 1000; // Add jitter
}

async function deliverWebhook(webhook: Record<string, unknown>, event: WebhookEvent, attempt: number = 1): Promise<boolean> {
  const payload = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `${timestamp}.${payload}`;
  
  try {
    const signature = await generateSignature(signaturePayload, webhook.secret);
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IoT-Platform-Webhooks/1.0',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp.toString(),
        'X-Webhook-Event-Type': event.type,
        'X-Webhook-Event-Id': event.id,
        'X-Webhook-Attempt': attempt.toString()
      },
      body: payload,
      signal: AbortSignal.timeout(webhook.timeout_seconds * 1000)
    });

    return response.ok;
  } catch (error) {
    console.error(`Webhook delivery failed for ${webhook.url}:`, error);
    return false;
  }
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

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);

    // POST /dispatch - Dispatch webhook event
    if (req.method === 'POST' && pathParts[0] === 'dispatch') {
      const deliveryData: WebhookDelivery = await req.json();

      if (!deliveryData.webhook_id || !deliveryData.event) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: webhook_id and event' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get webhook endpoint details
      const { data: webhook, error } = await supabaseClient
        .from('webhook_endpoints')
        .select('*')
        .eq('id', deliveryData.webhook_id)
        .eq('enabled', true)
        .single();

      if (error || !webhook) {
        return new Response(
          JSON.stringify({ error: 'Webhook endpoint not found or disabled' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if event type is subscribed
      if (!webhook.events.includes(deliveryData.event.type) && !webhook.events.includes('*')) {
        return new Response(
          JSON.stringify({ error: 'Event type not subscribed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const attempt = deliveryData.attempt || 1;
      const maxRetries = deliveryData.max_retries || webhook.retry_count || 3;

      // Create delivery record
      const { data: delivery, error: deliveryError } = await supabaseClient
        .from('webhook_deliveries')
        .insert({
          webhook_id: webhook.id,
          event_id: deliveryData.event.id,
          event_type: deliveryData.event.type,
          payload: deliveryData.event,
          attempt: attempt,
          status: 'pending'
        })
        .select()
        .single();

      if (deliveryError) {
        console.error('Error creating delivery record:', deliveryError);
        return new Response(
          JSON.stringify({ error: 'Failed to create delivery record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Attempt delivery
      const startTime = Date.now();
      const success = await deliverWebhook(webhook, deliveryData.event, attempt);
      const responseTime = Date.now() - startTime;

      if (success) {
        // Update delivery record as successful
        await supabaseClient
          .from('webhook_deliveries')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            response_time_ms: responseTime
          })
          .eq('id', delivery.id);

        return new Response(
          JSON.stringify({ 
            message: 'Webhook delivered successfully',
            delivery_id: delivery.id,
            attempt: attempt,
            response_time_ms: responseTime
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Mark delivery as failed
        await supabaseClient
          .from('webhook_deliveries')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
            response_time_ms: responseTime,
            error_message: 'HTTP request failed'
          })
          .eq('id', delivery.id);

        // Schedule retry if attempts remaining
        if (attempt < maxRetries) {
          const delay = calculateDelay(attempt);
          
          // Schedule retry using background task
          EdgeRuntime.waitUntil(
            new Promise((resolve) => {
              setTimeout(async () => {
                await supabaseClient.functions.invoke('webhook-dispatcher', {
                  body: {
                    webhook_id: deliveryData.webhook_id,
                    event: deliveryData.event,
                    attempt: attempt + 1,
                    max_retries: maxRetries
                  }
                });
                resolve(void 0);
              }, delay);
            })
          );

          return new Response(
            JSON.stringify({ 
              message: 'Webhook delivery failed, retry scheduled',
              delivery_id: delivery.id,
              attempt: attempt,
              next_attempt: attempt + 1,
              retry_delay_ms: delay
            }),
            { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // Move to dead letter queue
          await supabaseClient
            .from('webhook_deliveries')
            .update({
              status: 'dead_letter'
            })
            .eq('id', delivery.id);

          return new Response(
            JSON.stringify({ 
              message: 'Webhook delivery failed after all retries',
              delivery_id: delivery.id,
              final_attempt: attempt,
              status: 'dead_letter'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // POST /broadcast - Broadcast event to all matching webhooks
    if (req.method === 'POST' && pathParts[0] === 'broadcast') {
      const { organization_id, event } = await req.json();

      if (!organization_id || !event) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: organization_id and event' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get all webhooks that subscribe to this event type
      const { data: webhooks, error } = await supabaseClient
        .from('webhook_endpoints')
        .select('*')
        .eq('organization_id', organization_id)
        .eq('enabled', true);

      if (error) {
        console.error('Error fetching webhooks:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch webhook endpoints' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const matchingWebhooks = webhooks.filter(webhook => 
        webhook.events.includes(event.type) || webhook.events.includes('*')
      );

      // Dispatch to all matching webhooks
      const dispatches = matchingWebhooks.map(webhook =>
        supabaseClient.functions.invoke('webhook-dispatcher', {
          body: {
            webhook_id: webhook.id,
            event: event
          }
        })
      );

      await Promise.allSettled(dispatches);

      return new Response(
        JSON.stringify({ 
          message: 'Event broadcasted to webhooks',
          webhook_count: matchingWebhooks.length,
          event_id: event.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /deliveries - Get delivery history
    if (req.method === 'GET' && pathParts[0] === 'deliveries') {
      const webhookId = url.searchParams.get('webhook_id');
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabaseClient
        .from('webhook_deliveries')
        .select(`
          *,
          webhook_endpoints (
            url,
            organization_id
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (webhookId) {
        query = query.eq('webhook_id', webhookId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data: deliveries, error } = await query;

      if (error) {
        console.error('Error fetching deliveries:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch delivery history' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ deliveries }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in webhook-dispatcher function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
