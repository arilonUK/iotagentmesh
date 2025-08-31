
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'
import { corsHeaders } from '../_shared/cors.ts'
import type { Database } from '../_shared/database.types.ts'
import type { EndpointParameters } from '../../../src/types/endpoint.ts'
import { isEndpointParameters } from '../../../src/types/endpoint.ts'

// Get Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Define interface for trigger payload
interface TriggerPayload {
  endpointId: string
  payload?: Record<string, unknown>
  alarmEventId?: string
}

// Define interfaces for different endpoint configurations
interface EmailEndpointConfig {
  to: string[]
  subject: string
  body_template: string
}

interface TelegramEndpointConfig {
  bot_token: string
  chat_id: string
  message_template: string
}

interface WebhookEndpointConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body_template?: string
}

interface WhatsappEndpointConfig {
  phone_number_id: string
  access_token: string
  to_phone_number: string
  message_template: string
}

interface DeviceActionEndpointConfig {
  target_device_id: string
  action: string
  parameters?: EndpointParameters
}

interface IftttEndpointConfig {
  webhook_key: string
  event_name: string
  value1?: string
  value2?: string
  value3?: string
}

interface EndpointRecord {
  id: string
  type: 'email' | 'telegram' | 'webhook' | 'whatsapp' | 'device_action' | 'ifttt'
  configuration: unknown
  enabled: boolean
}

function isTriggerPayload(data: unknown): data is TriggerPayload {
  return typeof data === 'object' && data !== null && typeof (data as { endpointId?: unknown }).endpointId === 'string'
}

function isEmailEndpointConfig(config: unknown): config is EmailEndpointConfig {
  const c = config as EmailEndpointConfig
  return typeof config === 'object' && config !== null && Array.isArray(c.to) && typeof c.subject === 'string' && typeof c.body_template === 'string'
}

function isTelegramEndpointConfig(config: unknown): config is TelegramEndpointConfig {
  const c = config as TelegramEndpointConfig
  return typeof config === 'object' && config !== null && typeof c.bot_token === 'string' && typeof c.chat_id === 'string' && typeof c.message_template === 'string'
}

function isWebhookEndpointConfig(config: unknown): config is WebhookEndpointConfig {
  const c = config as WebhookEndpointConfig
  return typeof config === 'object' && config !== null && typeof c.url === 'string' && typeof c.method === 'string'
}

function isWhatsappEndpointConfig(config: unknown): config is WhatsappEndpointConfig {
  const c = config as WhatsappEndpointConfig
  return typeof config === 'object' && config !== null && typeof c.phone_number_id === 'string' && typeof c.access_token === 'string' && typeof c.to_phone_number === 'string' && typeof c.message_template === 'string'
}

function isDeviceActionEndpointConfig(config: unknown): config is DeviceActionEndpointConfig {
  const c = config as DeviceActionEndpointConfig
  return (
    typeof config === 'object' &&
    config !== null &&
    typeof c.target_device_id === 'string' &&
    typeof c.action === 'string' &&
    (c.parameters === undefined || isEndpointParameters(c.parameters))
  )
}

function isIftttEndpointConfig(config: unknown): config is IftttEndpointConfig {
  const c = config as IftttEndpointConfig
  return typeof config === 'object' && config !== null && typeof c.webhook_key === 'string' && typeof c.event_name === 'string'
}

// Handle HTTP requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get request data
    const body = await req.json()
    if (!isTriggerPayload(body)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    const { endpointId, payload = {}, alarmEventId } = body

    // Validate required fields
    if (!endpointId) {
      return new Response(JSON.stringify({ error: 'Endpoint ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Triggering endpoint: ${endpointId}`)

    // Get endpoint details
    const { data: endpoint, error } = await supabase
      .from('endpoints')
      .select('*')
      .eq('id', endpointId)
      .single<EndpointRecord>()

    if (error || !endpoint) {
      console.error('Error fetching endpoint:', error)
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if endpoint is enabled
    if (!endpoint.enabled) {
      console.log(`Endpoint ${endpoint.id} is disabled, skipping.`)
      return new Response(JSON.stringify({ error: 'Endpoint is disabled' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // If it's an alarm notification, get alarm event data
    let alarmData = null
    if (alarmEventId) {
      const { data: alarmEvent, error: alarmError } = await supabase
        .from('alarm_events')
        .select(`
          *,
          alarms:alarm_id (
            name,
            description,
            reading_type,
            severity,
            condition_operator,
            condition_value
          ),
          devices:device_id (
            name,
            type
          )
        `)
        .eq('id', alarmEventId)
        .single()

      if (!alarmError && alarmEvent) {
        alarmData = alarmEvent
        // Merge alarm data with payload
        payload.alarm = {
          id: alarmEvent.alarm_id,
          name: alarmEvent.alarms?.name,
          description: alarmEvent.alarms?.description,
          severity: alarmEvent.alarms?.severity,
          reading_type: alarmEvent.alarms?.reading_type,
          message: alarmEvent.message,
          triggered_at: alarmEvent.triggered_at,
          value: alarmEvent.trigger_value,
          device: alarmEvent.devices ? {
            id: alarmEvent.device_id,
            name: alarmEvent.devices?.name,
            type: alarmEvent.devices?.type
          } : null
        }
      }
    }

    // Record the execution attempt
    const executionStart = new Date()
    let success = false
    let executionResult = null

    try {
      // Execute endpoint based on type
      switch (endpoint.type) {
        case 'email': {
          if (!isEmailEndpointConfig(endpoint.configuration)) {
            throw new Error('Invalid email endpoint configuration')
          }
          executionResult = await handleEmailEndpoint(endpoint.configuration, payload)
          success = true
          break
        }
        case 'telegram': {
          if (!isTelegramEndpointConfig(endpoint.configuration)) {
            throw new Error('Invalid telegram endpoint configuration')
          }
          executionResult = await handleTelegramEndpoint(endpoint.configuration, payload)
          success = true
          break
        }
        case 'webhook': {
          if (!isWebhookEndpointConfig(endpoint.configuration)) {
            throw new Error('Invalid webhook endpoint configuration')
          }
          executionResult = await handleWebhookEndpoint(endpoint.configuration, payload)
          success = true
          break
        }
        case 'whatsapp': {
          if (!isWhatsappEndpointConfig(endpoint.configuration)) {
            throw new Error('Invalid whatsapp endpoint configuration')
          }
          executionResult = await handleWhatsappEndpoint(endpoint.configuration, payload)
          success = true
          break
        }
        case 'device_action': {
          if (!isDeviceActionEndpointConfig(endpoint.configuration)) {
            throw new Error('Invalid device action endpoint configuration')
          }
          executionResult = await handleDeviceActionEndpoint(endpoint.configuration, payload)
          success = true
          break
        }
        case 'ifttt': {
          if (!isIftttEndpointConfig(endpoint.configuration)) {
            throw new Error('Invalid IFTTT endpoint configuration')
          }
          executionResult = await handleIftttEndpoint(endpoint.configuration, payload)
          success = true
          break
        }
        default:
          throw new Error(`Unsupported endpoint type: ${endpoint.type}`)
      }

      // Record execution success
      await supabase
        .from('endpoint_executions')
        .insert({
          endpoint_id: endpoint.id,
          executed_at: executionStart.toISOString(),
          success: success,
          payload: { request: payload, response: executionResult }
        })

      // If this was triggered by an alarm, update the alarm_endpoints execution 
      if (alarmData && success) {
        // Update alarm event if needed - e.g., to mark as sent
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Endpoint ${endpoint.name} (${endpoint.type}) triggered successfully` 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } catch (e) {
      console.error(`Error executing ${endpoint.type} endpoint:`, e)

      // Record execution failure
      await supabase
        .from('endpoint_executions')
        .insert({
          endpoint_id: endpoint.id,
          executed_at: executionStart.toISOString(),
          success: false,
          payload: { request: payload, error: e.message }
        })

      return new Response(JSON.stringify({ error: `Failed to trigger ${endpoint.type} endpoint: ${e.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  } catch (e) {
    console.error('Unexpected error:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Handler for email endpoints
async function handleEmailEndpoint(config: EmailEndpointConfig, payload: Record<string, unknown>) {
  console.log('Simulating email send to:', config.to)
  // Replace with actual email sending code
  // Would integrate with a service like SendGrid, AWS SES, etc.
  
  // Example placeholder for email sending logic:
  // const emailBody = processTemplate(config.body_template, payload)
  // const emailSubject = processTemplate(config.subject, payload)
  // return await emailService.send({
  //   to: config.to,
  //   subject: emailSubject, 
  //   body: emailBody
  // })
  
  return { message: "Email endpoint triggered (simulation)" }
}

// Handler for Telegram endpoints
async function handleTelegramEndpoint(config: TelegramEndpointConfig, payload: Record<string, unknown>) {
  console.log('Sending Telegram message to chat:', config.chat_id)
  
  // Process the message template with payload data
  const message = processTemplate(config.message_template, payload)
  
  // Make request to Telegram Bot API
  const telegramUrl = `https://api.telegram.org/bot${config.bot_token}/sendMessage`
  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.chat_id,
      text: message,
      parse_mode: 'HTML'
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Telegram API error: ${response.status} ${errorText}`)
  }
  
  return await response.json()
}

// Handler for webhook endpoints
async function handleWebhookEndpoint(config: WebhookEndpointConfig, payload: Record<string, unknown>) {
  console.log('Calling webhook:', config.url, 'method:', config.method)
  
  // Prepare request options
  const options: RequestInit = {
    method: config.method,
    headers: { 
      'Content-Type': 'application/json',
      ...config.headers
    }
  }
  
  // For methods that support body, process the template
  if (config.method !== 'GET' && config.body_template) {
    options.body = JSON.stringify(
      config.method === 'POST' || config.method === 'PUT' 
        ? processTemplateObject(config.body_template, payload)
        : payload
    )
  }
  
  // Make the request
  const response = await fetch(config.url, options)
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Webhook error: ${response.status} ${errorText}`)
  }
  
  // Try to parse JSON response, fall back to text if not JSON
  try {
    return await response.json()
  } catch {
    return { text: await response.text() }
  }
}

// Handler for WhatsApp endpoints
async function handleWhatsappEndpoint(config: WhatsappEndpointConfig, payload: Record<string, unknown>) {
  console.log('Sending WhatsApp message to:', config.to_phone_number)
  
  // Process the message template with payload data
  const message = processTemplate(config.message_template, payload)
  
  // Example implementation for Meta WhatsApp Business API
  const whatsappUrl = `https://graph.facebook.com/v17.0/${config.phone_number_id}/messages`
  const response = await fetch(whatsappUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: config.to_phone_number,
      type: "text",
      text: { body: message }
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`WhatsApp API error: ${response.status} ${errorText}`)
  }
  
  return await response.json()
}

// Handler for device action endpoints
async function handleDeviceActionEndpoint(config: DeviceActionEndpointConfig, payload: Record<string, unknown>) {
  console.log('Executing device action on device:', config.target_device_id)
  
  // In a real implementation, this would interact with your device management API
  // For now, just log the action and parameters
  
  console.log(`Action: ${config.action}`)
  console.log(`Parameters:`, config.parameters)
  
  // You would implement actual device control logic here
  
  return { 
    success: true, 
    message: `Device action ${config.action} triggered for device ${config.target_device_id}` 
  }
}

// Handler for IFTTT endpoints
async function handleIftttEndpoint(config: IftttEndpointConfig, payload: Record<string, unknown>) {
  console.log('Triggering IFTTT webhook:', config.event_name)
  
  // Process values with payload data
  const value1 = config.value1 ? processTemplate(config.value1, payload) : undefined
  const value2 = config.value2 ? processTemplate(config.value2, payload) : undefined
  const value3 = config.value3 ? processTemplate(config.value3, payload) : undefined
  
  // Make request to IFTTT Webhooks API
  const iftttUrl = `https://maker.ifttt.com/trigger/${config.event_name}/with/key/${config.webhook_key}`
  const response = await fetch(iftttUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value1, value2, value3 })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`IFTTT API error: ${response.status} ${errorText}`)
  }
  
  return { text: await response.text() }
}

// Utility function to process templates with payload data
function processTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const keys = key.trim().split('.')
    let value = data
    
    // Navigate nested properties
    for (const k of keys) {
      if (value === undefined || value === null) return ''
      value = value[k]
    }
    
    return value !== undefined && value !== null ? String(value) : ''
  })
}

// Utility function to process JSON template with payload data
function processTemplateObject(templateStr: string, data: Record<string, unknown>): unknown {
  try {
    // Try to parse the template as JSON
    const template = JSON.parse(templateStr)
    
    // Recursively replace placeholders in the template
    return processObjectValues(template, data)
  } catch (e) {
    // If not valid JSON, treat as string template
    return processTemplate(templateStr, data)
  }
}

// Process object values recursively
function processObjectValues(obj: unknown, data: Record<string, unknown>): unknown {
  if (typeof obj === 'string') {
    return processTemplate(obj, data)
  } else if (Array.isArray(obj)) {
    return obj.map(item => processObjectValues(item, data))
  } else if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const key in obj) {
      result[key] = processObjectValues(obj[key], data)
    }
    return result
  }
  return obj
}
