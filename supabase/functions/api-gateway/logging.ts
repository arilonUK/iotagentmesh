
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function logRequest(
  path: string,
  method: string,
  status: number,
  headers: Headers,
  processingTime: number = 0
): Promise<void> {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient
      .from('api_requests_log')
      .insert({
        request_id: crypto.randomUUID(),
        endpoint: path,
        method: method,
        response_status: status,
        processing_time_ms: processingTime,
        ip_address: headers.get('CF-Connecting-IP') || headers.get('X-Forwarded-For'),
        user_agent: headers.get('User-Agent')
      });
  } catch (logError) {
    console.error('Failed to log request:', logError);
  }
}
