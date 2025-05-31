
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function forwardToDevicesHandler(
  req: Request,
  path: string,
  authHeader: string | null
): Promise<Response> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let body = null;
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    body = await req.text();
  }

  const targetUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/api-devices${path}`;
  console.log(`Forwarding to devices handler: ${targetUrl}`);

  const targetRequest = new Request(targetUrl, {
    method: req.method,
    headers: {
      'Authorization': authHeader || '',
      'Content-Type': req.headers.get('Content-Type') || 'application/json',
      'x-forwarded-path': path
    },
    body: body
  });

  return await fetch(targetRequest);
}
