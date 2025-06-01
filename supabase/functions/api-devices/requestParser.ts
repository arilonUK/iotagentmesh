
export interface ParsedRequest {
  httpMethod: string;
  deviceId: string | null;
  requestBody: any;
}

export function parseRequest(req: Request, url: URL): ParsedRequest {
  const pathParts = url.pathname.split('/').filter(part => part && part !== 'api-devices');
  let deviceId: string | null = pathParts.length > 0 ? pathParts[0] : null;
  let httpMethod = req.method;
  let requestBody: any = {};

  console.log('URL pathname:', url.pathname);
  console.log('Path parts:', pathParts);
  console.log('Device ID from URL:', deviceId);

  return { httpMethod, deviceId, requestBody };
}

export async function parseRequestBody(req: Request, parsedRequest: ParsedRequest): Promise<ParsedRequest> {
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      
      if (bodyText && bodyText.trim()) {
        const parsedBody = JSON.parse(bodyText);
        console.log('Parsed request body:', parsedBody);
        
        // Handle Supabase client format { method: 'POST', path: '', data: {...} }
        // BUT only if it's actually specifying a different method
        if (parsedBody.method && parsedBody.method !== req.method) {
          parsedRequest.httpMethod = parsedBody.method;
          if (parsedBody.path && parsedBody.path !== '') {
            parsedRequest.deviceId = parsedBody.path.replace('/', '');
          }
          parsedRequest.requestBody = parsedBody.data || {};
          console.log('Supabase client format with method override - method:', parsedRequest.httpMethod, 'deviceId:', parsedRequest.deviceId, 'data:', parsedRequest.requestBody);
        } else {
          // Handle direct API calls or same-method Supabase calls
          parsedRequest.requestBody = parsedBody.data || parsedBody;
          console.log('Direct API call format detected - data:', parsedRequest.requestBody);
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
