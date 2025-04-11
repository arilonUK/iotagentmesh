import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.37.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EmailConfig = {
  to: string[];
  subject: string;
  body_template: string;
};

type TelegramConfig = {
  bot_token: string;
  chat_id: string;
  message_template: string;
};

type WebhookConfig = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body_template?: string;
};

type IftttConfig = {
  webhook_key: string;
  event_name: string;
  value1?: string;
  value2?: string;
  value3?: string;
};

type DeviceActionConfig = {
  target_device_id: string;
  action: string;
  parameters?: Record<string, any>;
};

async function triggerEmail(config: EmailConfig, payload: any): Promise<boolean> {
  try {
    console.log('Sending email to:', config.to);
    
    // Replace template variables in subject and body
    const subject = replaceTemplateVars(config.subject, payload);
    const body = replaceTemplateVars(config.body_template, payload);
    
    // In a real implementation, you would use an email service like SendGrid, AWS SES, etc.
    console.log('Email sent:', { to: config.to, subject, body });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

async function triggerTelegram(config: TelegramConfig, payload: any): Promise<boolean> {
  try {
    const message = replaceTemplateVars(config.message_template, payload);
    const url = `https://api.telegram.org/bot${config.bot_token}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chat_id,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

async function triggerWebhook(config: WebhookConfig, payload: any): Promise<boolean> {
  try {
    let body = undefined;
    
    if (config.body_template) {
      body = replaceTemplateVars(config.body_template, payload);
      
      // If it looks like JSON, parse it to an object
      if (body.trim().startsWith('{') && body.trim().endsWith('}')) {
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.warn('Could not parse body template as JSON:', e);
          // Keep as string if parsing fails
        }
      }
    }
    
    const headers = {
      ...(config.headers || {}),
    };
    
    // Add default content-type if not specified and body is an object
    if (typeof body === 'object' && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(config.url, {
      method: config.method,
      headers,
      body: typeof body === 'object' ? JSON.stringify(body) : body,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error triggering webhook:', error);
    return false;
  }
}

async function triggerIfttt(config: IftttConfig, payload: any): Promise<boolean> {
  try {
    const url = `https://maker.ifttt.com/trigger/${config.event_name}/with/key/${config.webhook_key}`;
    
    const iftttPayload: Record<string, string> = {};
    
    if (config.value1) iftttPayload.value1 = replaceTemplateVars(config.value1, payload);
    if (config.value2) iftttPayload.value2 = replaceTemplateVars(config.value2, payload);
    if (config.value3) iftttPayload.value3 = replaceTemplateVars(config.value3, payload);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(iftttPayload),
    });
    
    if (!response.ok) {
      throw new Error(`IFTTT API error! Status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error triggering IFTTT:', error);
    return false;
  }
}

async function triggerDeviceAction(
  config: DeviceActionConfig,
  payload: any,
  supabase: any
): Promise<boolean> {
  try {
    // First, verify the device exists and user has access
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, organization_id')
      .eq('id', config.target_device_id)
      .single();
    
    if (deviceError || !device) {
      throw new Error(`Device not found: ${deviceError?.message || 'Unknown error'}`);
    }
    
    // In a real implementation, you would:
    // 1. Send a command to the device through a message queue or device API
    // 2. Update the device state in your database
    
    // Here we'll just log it and update a commands table
    const { error: commandError } = await supabase
      .from('device_commands')
      .insert({
        device_id: config.target_device_id,
        action: config.action,
        parameters: config.parameters || {},
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    
    if (commandError) {
      throw new Error(`Failed to record device command: ${commandError.message}`);
    }
    
    console.log('Device action triggered:', {
      device_id: config.target_device_id,
      action: config.action,
      parameters: config.parameters,
    });
    
    return true;
  } catch (error) {
    console.error('Error triggering device action:', error);
    return false;
  }
}

// Helper function to replace template variables in strings
function replaceTemplateVars(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = key.split('.').reduce((obj: any, path: string) => {
      return obj?.[path] ?? null;
    }, data);
    
    return value !== null && value !== undefined ? String(value) : match;
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get request data
    const { endpointId, payload = {} } = await req.json();

    if (!endpointId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Endpoint ID is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the endpoint configuration
    const { data: endpoint, error: endpointError } = await supabaseClient
      .from('endpoints')
      .select('*')
      .eq('id', endpointId)
      .single();

    if (endpointError || !endpoint) {
      return new Response(
        JSON.stringify({ success: false, error: `Endpoint not found: ${endpointError?.message || 'Unknown error'}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the endpoint is enabled
    if (!endpoint.enabled) {
      return new Response(
        JSON.stringify({ success: false, error: 'Endpoint is disabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default payload with useful context data
    const enrichedPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
      endpoint_id: endpointId,
      endpoint_name: endpoint.name,
    };

    // Trigger the appropriate endpoint type
    let success = false;

    switch (endpoint.type) {
      case 'email':
        success = await triggerEmail(endpoint.configuration as EmailConfig, enrichedPayload);
        break;
      
      case 'telegram':
        success = await triggerTelegram(endpoint.configuration as TelegramConfig, enrichedPayload);
        break;
      
      case 'webhook':
        success = await triggerWebhook(endpoint.configuration as WebhookConfig, enrichedPayload);
        break;
      
      case 'ifttt':
        success = await triggerIfttt(endpoint.configuration as IftttConfig, enrichedPayload);
        break;
      
      case 'device_action':
        success = await triggerDeviceAction(
          endpoint.configuration as DeviceActionConfig, 
          enrichedPayload,
          supabaseClient
        );
        break;
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unsupported endpoint type: ${endpoint.type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Log the endpoint execution
    await supabaseClient
      .from('endpoint_executions')
      .insert({
        endpoint_id: endpointId,
        success: success,
        payload: enrichedPayload,
        executed_at: new Date().toISOString(),
      })
      .select();

    return new Response(
      JSON.stringify({ success }),
      { status: success ? 200 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in trigger-endpoint function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
