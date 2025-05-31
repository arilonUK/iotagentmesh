
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateAlarmRequest {
  name: string;
  description?: string;
  device_id: string | null;
  enabled: boolean;
  reading_type: string;
  condition_operator: string;
  condition_value: any;
  severity: string;
  cooldown_minutes?: number;
  endpoints: string[];
}

interface UpdateAlarmRequest {
  name?: string;
  description?: string;
  device_id?: string | null;
  enabled?: boolean;
  reading_type?: string;
  condition_operator?: string;
  condition_value?: any;
  severity?: string;
  cooldown_minutes?: number;
  endpoints?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's organization
    const { data: orgMember, error: orgError } = await supabaseClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()

    if (orgError || !orgMember) {
      return new Response(
        JSON.stringify({ error: 'User not associated with any organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const method = req.method
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    // Route based on method and path
    if (method === 'GET' && pathParts.length === 0) {
      // Get all alarms for organization
      return await getAlarms(supabaseClient, orgMember.organization_id)
    } else if (method === 'POST' && pathParts.length === 0) {
      // Create new alarm
      const requestData: CreateAlarmRequest = await req.json()
      return await createAlarm(supabaseClient, orgMember.organization_id, requestData, user.id)
    } else if (method === 'PUT' && pathParts.length === 1) {
      // Update alarm
      const alarmId = pathParts[0]
      const requestData: UpdateAlarmRequest = await req.json()
      return await updateAlarm(supabaseClient, alarmId, requestData, orgMember.organization_id, user.id)
    } else if (method === 'DELETE' && pathParts.length === 1) {
      // Delete alarm
      const alarmId = pathParts[0]
      return await deleteAlarm(supabaseClient, alarmId, orgMember.organization_id, user.id)
    } else if (method === 'POST' && pathParts.length === 2 && pathParts[1] === 'test') {
      // Test alarm
      const alarmId = pathParts[0]
      return await testAlarm(supabaseClient, alarmId, orgMember.organization_id, user.id)
    } else {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in api-alarms function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getAlarms(supabaseClient: any, organizationId: string) {
  try {
    const { data, error } = await supabaseClient.rpc('get_alarms_with_details', {
      p_organization_id: organizationId
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ alarms: data || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching alarms:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch alarms' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function createAlarm(supabaseClient: any, organizationId: string, requestData: CreateAlarmRequest, userId: string) {
  try {
    // Validate request data
    if (!requestData.name || !requestData.reading_type || !requestData.condition_operator) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, reading_type, condition_operator' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create alarm
    const { data: alarm, error: createError } = await supabaseClient
      .from('alarms')
      .insert({
        organization_id: organizationId,
        name: requestData.name,
        description: requestData.description,
        device_id: requestData.device_id,
        enabled: requestData.enabled,
        reading_type: requestData.reading_type,
        condition_operator: requestData.condition_operator,
        condition_value: requestData.condition_value,
        severity: requestData.severity,
        cooldown_minutes: requestData.cooldown_minutes || 15,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating alarm:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create alarm' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create alarm-endpoint associations
    if (requestData.endpoints && requestData.endpoints.length > 0) {
      const endpointAssociations = requestData.endpoints.map(endpointId => ({
        alarm_id: alarm.id,
        endpoint_id: endpointId
      }))

      await supabaseClient
        .from('alarm_endpoints')
        .insert(endpointAssociations)
    }

    // Create audit log entry
    await supabaseClient.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_action: 'alarm_created',
      p_details: { alarm_id: alarm.id, alarm_name: requestData.name }
    })

    // Trigger webhook notification
    await triggerWebhookNotification(supabaseClient, organizationId, {
      type: 'alarm.created',
      data: {
        alarm_id: alarm.id,
        alarm_name: alarm.name,
        severity: alarm.severity,
        organization_id: organizationId
      }
    })

    return new Response(
      JSON.stringify({ alarm }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating alarm:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create alarm' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function updateAlarm(supabaseClient: any, alarmId: string, requestData: UpdateAlarmRequest, organizationId: string, userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('alarms')
      .update({ 
        ...requestData, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', alarmId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) throw error

    // Update alarm-endpoint associations if provided
    if (requestData.endpoints !== undefined) {
      // Remove existing associations
      await supabaseClient
        .from('alarm_endpoints')
        .delete()
        .eq('alarm_id', alarmId)

      // Add new associations
      if (requestData.endpoints.length > 0) {
        const endpointAssociations = requestData.endpoints.map(endpointId => ({
          alarm_id: alarmId,
          endpoint_id: endpointId
        }))

        await supabaseClient
          .from('alarm_endpoints')
          .insert(endpointAssociations)
      }
    }

    // Create audit log entry
    await supabaseClient.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_action: 'alarm_updated',
      p_details: { alarm_id: alarmId, changes: requestData }
    })

    // Trigger webhook notification
    await triggerWebhookNotification(supabaseClient, organizationId, {
      type: 'alarm.updated',
      data: {
        alarm_id: alarmId,
        alarm_name: data.name,
        severity: data.severity,
        enabled: data.enabled,
        organization_id: organizationId
      }
    })

    return new Response(
      JSON.stringify({ alarm: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating alarm:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update alarm' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function deleteAlarm(supabaseClient: any, alarmId: string, organizationId: string, userId: string) {
  try {
    // Get the alarm details before deletion for audit log
    const { data: alarmData } = await supabaseClient
      .from('alarms')
      .select('name')
      .eq('id', alarmId)
      .eq('organization_id', organizationId)
      .single()

    // Delete alarm-endpoint associations first
    await supabaseClient
      .from('alarm_endpoints')
      .delete()
      .eq('alarm_id', alarmId)

    // Delete the alarm
    const { error } = await supabaseClient
      .from('alarms')
      .delete()
      .eq('id', alarmId)
      .eq('organization_id', organizationId)

    if (error) throw error

    // Create audit log entry
    await supabaseClient.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_action: 'alarm_deleted',
      p_details: { alarm_id: alarmId, alarm_name: alarmData?.name }
    })

    // Trigger webhook notification
    await triggerWebhookNotification(supabaseClient, organizationId, {
      type: 'alarm.deleted',
      data: {
        alarm_id: alarmId,
        alarm_name: alarmData?.name,
        organization_id: organizationId
      }
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error deleting alarm:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete alarm' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function testAlarm(supabaseClient: any, alarmId: string, organizationId: string, userId: string) {
  try {
    // Get alarm details
    const { data: alarm, error: alarmError } = await supabaseClient
      .from('alarms')
      .select('*')
      .eq('id', alarmId)
      .eq('organization_id', organizationId)
      .single()

    if (alarmError || !alarm) {
      return new Response(
        JSON.stringify({ error: 'Alarm not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a test alarm event
    const { data: alarmEvent, error: eventError } = await supabaseClient
      .from('alarm_events')
      .insert({
        alarm_id: alarmId,
        device_id: alarm.device_id,
        status: 'active',
        trigger_value: 999,
        message: `Test alarm triggered for ${alarm.name}`
      })
      .select()
      .single()

    if (eventError) {
      console.error('Error creating test alarm event:', eventError)
      return new Response(
        JSON.stringify({ error: 'Failed to create test alarm event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Trigger webhook notification
    await triggerWebhookNotification(supabaseClient, organizationId, {
      type: 'alarm.triggered',
      data: {
        alarm_id: alarmId,
        alarm_name: alarm.name,
        severity: alarm.severity,
        device_id: alarm.device_id,
        trigger_value: 999,
        message: alarmEvent.message,
        organization_id: organizationId,
        test: true
      }
    })

    // Create audit log entry
    await supabaseClient.rpc('create_audit_log_entry', {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_action: 'alarm_tested',
      p_details: { alarm_id: alarmId, alarm_name: alarm.name }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test alarm triggered successfully',
        event: alarmEvent
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error testing alarm:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to test alarm' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function triggerWebhookNotification(supabaseClient: any, organizationId: string, event: any) {
  try {
    await supabaseClient.functions.invoke('webhook-dispatcher', {
      body: {
        organization_id: organizationId,
        event: {
          id: crypto.randomUUID(),
          type: event.type,
          created: new Date().toISOString(),
          data: event.data
        }
      }
    })
  } catch (error) {
    console.error('Failed to trigger webhook notification:', error)
    // Don't fail the main operation if webhook fails
  }
}
