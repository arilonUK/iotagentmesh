
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface AuthContext {
  user: any;
  organization_id?: string;
  api_key_id?: string;
}

export async function authenticateRequest(authHeader: string | null): Promise<AuthContext | null> {
  if (!authHeader) {
    return null;
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Check if it's an API key or JWT token
  if (authHeader.startsWith('Bearer iot_')) {
    // API key authentication
    const response = await supabaseClient.functions.invoke('api-auth', {
      headers: { Authorization: authHeader }
    });
    
    if (response.data?.success) {
      return {
        user: null,
        organization_id: response.data.organization_id,
        api_key_id: response.data.api_key_id
      };
    }
  } else {
    // JWT authentication
    const { data: { user }, error } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (!error && user) {
      return { user };
    }
  }

  return null;
}
