
import { supabase } from '@/integrations/supabase/client';

export interface ApiGatewayRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: Record<string, unknown> | Array<unknown> | string | number | boolean | null;
  headers?: Record<string, string>;
}

export interface ApiGatewayResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  processing_time?: number;
}

export class ApiGatewayClient {
  private baseUrl = 'https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway';

  /**
   * Make an API request through the gateway
   */
  async request<T = unknown>(request: ApiGatewayRequest): Promise<ApiGatewayResponse<T>> {
    try {
      console.log('API Gateway request:', request);
      
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Prepare headers for the edge function
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(request.headers || {})
      };
      
      // Add authorization header if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Build the full URL for the edge function call
      const url = `${this.baseUrl}${request.endpoint}`;
      
      console.log('Making request to:', url);
      console.log('Method:', request.method);
      console.log('Headers:', headers);
      console.log('Body:', request.data);

      // Make the actual HTTP request to the edge function
      const response = await fetch(url, {
        method: request.method,
        headers,
        body: request.data ? JSON.stringify(request.data) : undefined
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return {
          error: 'Invalid response format',
          status: response.status
        };
      }

      if (!response.ok) {
        return {
          error: responseData?.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }

      return {
        data: responseData,
        status: response.status
      };
    } catch (error) {
      console.error('API Gateway service error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 500
      };
    }
  }

  /**
   * Get API documentation URL
   */
  getDocumentationUrl(): string {
    return `${this.baseUrl}/api/docs`;
  }
}
