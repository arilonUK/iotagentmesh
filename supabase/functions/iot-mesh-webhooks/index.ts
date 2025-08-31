import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

interface WebhookPayload {
  event_type: string
  timestamp: string
  agent_id?: string
  device_id?: string
  data: Record<string, unknown>
  organization_id?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify webhook signature if configured
    const webhookSecret = Deno.env.get('IOT_MESH_WEBHOOK_SECRET')
    const signature = req.headers.get('x-webhook-signature')

    if (webhookSecret && signature) {
      const body = await req.text()
      const isValid = await verifyWebhookSignature(body, signature, webhookSecret)
      
      if (!isValid) {
        console.error('Invalid webhook signature')
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: corsHeaders }
        )
      }

      // Re-parse the body since we consumed it for verification
      const payload: WebhookPayload = JSON.parse(body)
      return await processWebhook(supabase, payload)
    } else {
      // No signature verification required
      const payload: WebhookPayload = await req.json()
      return await processWebhook(supabase, payload)
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})

async function processWebhook(supabase: ReturnType<typeof createClient>, payload: WebhookPayload) {
  console.log('Processing webhook:', payload.event_type)

  try {
    switch (payload.event_type) {
      case 'device.telemetry':
        await handleDeviceTelemetry(supabase, payload)
        break
      
      case 'agent.status_change':
        await handleAgentStatusChange(supabase, payload)
        break
      
      case 'device.status_change':
        await handleDeviceStatusChange(supabase, payload)
        break
      
      case 'mcp.event':
        await handleMCPEvent(supabase, payload)
        break
      
      case 'alert.triggered':
        await handleAlertTriggered(supabase, payload)
        break

      default:
        console.log('Unknown webhook event type:', payload.event_type)
    }

    // Log the webhook event
    EdgeRuntime.waitUntil(
      logWebhookEvent(supabase, payload)
    )

    return new Response(
      JSON.stringify({ status: 'processed' }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Processing failed' }),
      { status: 500, headers: corsHeaders }
    )
  }
}

async function handleDeviceTelemetry(supabase: ReturnType<typeof createClient>, payload: WebhookPayload) {
  if (!payload.device_id || !payload.data) return

  // Find the local device by mesh device ID
  const { data: device } = await supabase
    .from('devices')
    .select('id, organization_id')
    .eq('id', payload.device_id)
    .single()

  if (device) {
    // Insert telemetry data as device readings
    const readings = Array.isArray(payload.data.readings) ? payload.data.readings : [payload.data]
    
    for (const reading of readings) {
      await supabase
        .from('device_readings')
        .insert({
          device_id: device.id,
          organization_id: device.organization_id,
          reading_type: reading.type || 'telemetry',
          value: reading.value,
          timestamp: payload.timestamp,
          metadata: {
            source: 'iot_agent_mesh',
            agent_id: payload.agent_id,
            original_payload: reading
          }
        })
    }
  }
}

async function handleAgentStatusChange(supabase: ReturnType<typeof createClient>, payload: WebhookPayload) {
  if (!payload.agent_id) return

  // Update agent status in database
  await supabase
    .from('api_usage')
    .insert({
      organization_id: payload.organization_id,
      endpoint: '/webhooks/agent-status',
      method: 'POST',
      status_code: 200,
      metadata: {
        event_type: 'agent.status_change',
        agent_id: payload.agent_id,
        status: payload.data.status
      }
    })
}

async function handleDeviceStatusChange(supabase: ReturnType<typeof createClient>, payload: WebhookPayload) {
  if (!payload.device_id) return

  // Update device status
  await supabase
    .from('devices')
    .update({
      status: payload.data.status,
      last_active_at: payload.timestamp
    })
    .eq('id', payload.device_id)
}

async function handleMCPEvent(supabase: ReturnType<typeof createClient>, payload: WebhookPayload) {
  // Log MCP events for monitoring
  await supabase
    .from('api_usage')
    .insert({
      organization_id: payload.organization_id,
      endpoint: '/webhooks/mcp-event',
      method: 'POST',
      status_code: 200,
      metadata: {
        event_type: 'mcp.event',
        mcp_event: payload.data
      }
    })
}

async function handleAlertTriggered(supabase: ReturnType<typeof createClient>, payload: WebhookPayload) {
  if (!payload.device_id) return

  // Create alarm event
  const { data: device } = await supabase
    .from('devices')
    .select('organization_id')
    .eq('id', payload.device_id)
    .single()

  if (device) {
    // Find or create corresponding alarm
    const { data: alarm } = await supabase
      .from('alarms')
      .select('id')
      .eq('device_id', payload.device_id)
      .eq('name', payload.data.alert_name || 'IoT Mesh Alert')
      .single()

    if (alarm) {
      await supabase
        .from('alarm_events')
        .insert({
          alarm_id: alarm.id,
          device_id: payload.device_id,
          status: 'active',
          triggered_at: payload.timestamp,
          message: payload.data.message || 'Alert triggered from IoT Agent Mesh',
          trigger_value: payload.data.value
        })
    }
  }
}

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return signature === `sha256=${expectedSignature}`
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

async function logWebhookEvent(supabase: ReturnType<typeof createClient>, payload: WebhookPayload) {
  try {
    await supabase
      .from('api_usage')
      .insert({
        organization_id: payload.organization_id,
        endpoint: '/webhooks/iot-mesh',
        method: 'POST',
        status_code: 200,
        metadata: {
          webhook_event: payload.event_type,
          processed_at: new Date().toISOString()
        }
      })
  } catch (error) {
    console.error('Failed to log webhook event:', error)
  }
}