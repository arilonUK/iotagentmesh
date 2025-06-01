
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'

interface DeviceData {
  name: string;
  type: string;
  status?: string;
  description?: string;
  product_template_id?: string;
}

export async function getAllDevices(organization_id: string): Promise<Response> {
  console.log('=== FETCHING ALL DEVICES ===');
  console.log('Organization ID:', organization_id);
  
  if (!organization_id) {
    console.error('No organization ID available for device fetch');
    return new Response(
      JSON.stringify({ error: 'No organization ID found' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  try {
    console.log('Calling get_devices_by_org_id with organization_id:', organization_id);
    
    const { data: devices, error } = await supabaseClient
      .rpc('get_devices_by_org_id', { p_organization_id: organization_id });

    console.log('RPC call completed');
    console.log('Error:', error);
    console.log('Data:', devices);

    if (error) {
      console.error('Error fetching devices:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch devices', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${devices?.length || 0} devices`);
    console.log('Devices data:', devices);

    // Ensure we return an array
    const deviceList = Array.isArray(devices) ? devices : (devices ? [devices] : []);

    console.log('Returning device list:', deviceList);
    return new Response(
      JSON.stringify(deviceList),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (dbError) {
    console.error('Database error:', dbError);
    return new Response(
      JSON.stringify({ error: 'Database error', details: dbError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

export async function getDeviceById(deviceId: string, organization_id: string): Promise<Response> {
  console.log('Fetching specific device:', deviceId);
  
  // Validate that deviceId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(deviceId)) {
    console.error('Invalid device ID format:', deviceId);
    return new Response(
      JSON.stringify({ error: 'Invalid device ID format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  try {
    const { data: device, error } = await supabaseClient
      .rpc('get_device_by_id_bypass_rls', { p_device_id: deviceId });

    if (error) {
      console.error('Error fetching device:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch device', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!device || device.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Device not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if device belongs to the organization
    if (device[0].organization_id !== organization_id) {
      return new Response(
        JSON.stringify({ error: 'Device not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(device[0]),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (dbError) {
    console.error('Database error:', dbError);
    return new Response(
      JSON.stringify({ error: 'Database error', details: dbError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

export async function createDevice(deviceData: DeviceData, organization_id: string): Promise<Response> {
  console.log('Creating new device with body:', deviceData);
  console.log('Device data to create:', deviceData);

  if (!deviceData.name || !deviceData.type) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: name and type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { data: device, error } = await supabaseClient
      .rpc('create_device_bypass_rls', {
        p_name: deviceData.name,
        p_type: deviceData.type,
        p_status: deviceData.status || 'offline',
        p_description: deviceData.description || null,
        p_organization_id: organization_id,
        p_product_template_id: deviceData.product_template_id || null
      });

    if (error) {
      console.error('Error creating device:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create device', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Device created successfully:', device);
    return new Response(
      JSON.stringify(device),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (dbError) {
    console.error('Database error creating device:', dbError);
    return new Response(
      JSON.stringify({ error: 'Database error', details: dbError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

export async function updateDevice(deviceId: string, updateData: Partial<DeviceData>): Promise<Response> {
  console.log('Updating device:', deviceId, 'with body:', updateData);
  console.log('Update data:', updateData);

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { data: device, error } = await supabaseClient
      .rpc('update_device_bypass_rls', {
        p_device_id: deviceId,
        p_data: JSON.stringify(updateData)
      });

    if (error) {
      console.error('Error updating device:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update device', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Device updated successfully:', device);
    return new Response(
      JSON.stringify(device),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (dbError) {
    console.error('Database error updating device:', dbError);
    return new Response(
      JSON.stringify({ error: 'Database error', details: dbError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

export async function deleteDevice(deviceId: string): Promise<Response> {
  console.log('Deleting device:', deviceId);
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  try {
    const { error } = await supabaseClient
      .rpc('delete_device_bypass_rls', { p_device_id: deviceId });

    if (error) {
      console.error('Error deleting device:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to delete device', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Device deleted successfully');
    return new Response(
      JSON.stringify({ message: 'Device deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (dbError) {
    console.error('Database error deleting device:', dbError);
    return new Response(
      JSON.stringify({ error: 'Database error', details: dbError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
