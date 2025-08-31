
export interface ParsedRequest {
  httpMethod: string;
  deviceId: string | null;
  requestBody: Record<string, unknown>;
}

export function parseRequest(req: Request, url: URL): ParsedRequest {
  const pathParts = url.pathname.split('/').filter(part => part && part !== 'api-devices');
  let deviceId: string | null = pathParts.length > 0 ? pathParts[0] : null;
  let httpMethod = req.method;
  let requestBody: Record<string, unknown> = {};

  console.log('URL pathname:', url.pathname);
  console.log('Path parts:', pathParts);
  console.log('Device ID from URL:', deviceId);

  return { httpMethod, deviceId, requestBody };
}

export async function parseRequestBody(req: Request, parsedRequest: ParsedRequest): Promise<ParsedRequest> {
  // Only parse body for POST and PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      
      if (bodyText && bodyText.trim()) {
        const parsedBody = JSON.parse(bodyText);
        console.log('Parsed request body:', parsedBody);
        
        // Handle Supabase client format { method: 'POST', path: '', data: {...} }
        // BUT only if the method is different from the HTTP method OR if there's actual data
        if (parsedBody.method && parsedBody.method !== req.method) {
          console.log('Supabase client format with method override detected');
          parsedRequest.httpMethod = parsedBody.method;
          if (parsedBody.path && parsedBody.path !== '') {
            parsedRequest.deviceId = parsedBody.path.replace('/', '');
          }
          parsedRequest.requestBody = (parsedBody.data as Record<string, unknown>) || {};
        } else if (parsedBody.data) {
          // Handle Supabase client format with data
          parsedRequest.requestBody = parsedBody.data as Record<string, unknown>;
          console.log('Supabase client format with data detected');
        } else {
          // Handle direct API calls
          parsedRequest.requestBody = parsedBody as Record<string, unknown>;
          console.log('Direct API call format detected');
        }
      } else {
        console.log('Empty request body for POST/PUT request');
        // For empty bodies on POST/PUT, this might be a Supabase client issue
        // Let's treat empty POST requests as potential GET requests from the client
        if (req.method === 'POST' && !parsedRequest.deviceId) {
          console.log('Converting empty POST to GET request');
          parsedRequest.httpMethod = 'GET';
        }
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }
  }

  console.log('Final parsed values - Method:', parsedRequest.httpMethod, 'DeviceId:', parsedRequest.deviceId);
  return parsedRequest;
}
