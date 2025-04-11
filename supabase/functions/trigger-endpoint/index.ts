
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the JWT token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with Admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get request body
    const { endpointId, payload } = await req.json();
    
    if (!endpointId) {
      return new Response(
        JSON.stringify({ error: 'Missing endpointId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get JWT claims to get the user ID
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: jwtError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (jwtError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid JWT' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the endpoint
    const { data: endpoint, error: fetchError } = await supabaseAdmin
      .from('endpoints')
      .select('*')
      .eq('id', endpointId)
      .single();

    if (fetchError || !endpoint) {
      return new Response(
        JSON.stringify({ error: 'Endpoint not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user permission (user must be in the same organization as the endpoint)
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('organization_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', endpoint.organization_id)
      .single();
    
    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If endpoint is not enabled, return error
    if (!endpoint.enabled) {
      return new Response(
        JSON.stringify({ error: 'Endpoint is disabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the execution attempt
    const { data: execution, error: execError } = await supabaseAdmin
      .from('endpoint_executions')
      .insert({
        endpoint_id: endpointId,
        payload: payload || {},
        success: false, // Initially set to false, will update if successful
        executed_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (execError) {
      console.error('Error recording endpoint execution:', execError);
    }

    // Placeholder for actual endpoint execution logic
    // In a real implementation, this is where you'd handle the different endpoint types 
    // based on endpoint.type and endpoint.configuration
    let success = false;
    let response = {};

    try {
      // Simplified example for demonstration:
      switch (endpoint.type) {
        case 'webhook':
          if (endpoint.configuration.url) {
            // Execute webhook logic here
            console.log(`Would call webhook at ${endpoint.configuration.url}`);
            // For demo, we'll just pretend it worked
            success = true;
            response = { message: `Webhook triggered successfully at ${endpoint.configuration.url}` };
          }
          break;
        case 'email':
          console.log(`Would send email to ${endpoint.configuration.to}`);
          // For demo, we'll just pretend it worked
          success = true;
          response = { message: `Email would be sent to ${endpoint.configuration.to}` };
          break;
        case 'whatsapp':
          console.log(`Would send WhatsApp message to ${endpoint.configuration.to_phone_number}`);
          // For demo, we'll just pretend it worked
          success = true;
          response = { message: `WhatsApp message would be sent to ${endpoint.configuration.to_phone_number}` };
          break;
        default:
          console.log(`Endpoint type ${endpoint.type} not implemented yet`);
          success = false;
          response = { error: `Endpoint type ${endpoint.type} not implemented yet` };
      }

      // Update the execution record
      if (execution?.id) {
        await supabaseAdmin
          .from('endpoint_executions')
          .update({ success })
          .eq('id', execution.id);
      }

      if (success) {
        return new Response(
          JSON.stringify({ success, ...response }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ success, error: 'Failed to execute endpoint', ...response }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    } catch (err) {
      console.error('Error executing endpoint:', err);
      
      // Update the execution record to show failure
      if (execution?.id) {
        await supabaseAdmin
          .from('endpoint_executions')
          .update({ success: false })
          .eq('id', execution.id);
      }

      return new Response(
        JSON.stringify({ error: 'Error executing endpoint', details: err.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
