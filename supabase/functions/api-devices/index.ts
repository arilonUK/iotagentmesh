
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCors } from './cors.ts'
import { authenticateRequest } from './auth.ts'
import { parseRequest, parseRequestBody } from './requestParser.ts'
import { getAllDevices, getDeviceById, createDevice, updateDevice, deleteDevice } from './deviceOperations.ts'

serve(async (req) => {
  console.log(`=== API-DEVICES FUNCTION START ===`);
  console.log(`Request method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);

  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Authenticate request
    const { organization_id, user_id } = await authenticateRequest(req);

    // Parse URL and request
    const url = new URL(req.url);
    let parsedRequest = parseRequest(req, url);
    parsedRequest = await parseRequestBody(req, parsedRequest);

    console.log('Organization ID for operation:', organization_id);

    const { httpMethod, deviceId, requestBody } = parsedRequest;

    // Route requests to appropriate handlers
    if (httpMethod === 'GET' && !deviceId) {
      return await getAllDevices(organization_id);
    }

    if (httpMethod === 'GET' && deviceId) {
      return await getDeviceById(deviceId, organization_id);
    }

    if (httpMethod === 'POST' && !deviceId) {
      return await createDevice(requestBody, organization_id);
    }

    if (httpMethod === 'PUT' && deviceId) {
      return await updateDevice(deviceId, requestBody);
    }

    if (httpMethod === 'DELETE' && deviceId) {
      return await deleteDevice(deviceId);
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed or invalid path' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== API-DEVICES FUNCTION ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
