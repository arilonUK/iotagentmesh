import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExternalApiConfig {
  baseUrl: string;
  apiKey?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
}

export interface ExternalApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

export abstract class ExternalApiService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected abstract readonly config: ExternalApiConfig;
  protected abstract readonly entityName: string;

  protected async makeExternalRequest<R = unknown>(options: ExternalApiRequestOptions): Promise<R> {
    const { method, endpoint, data, headers = {}, timeout = 30000 } = options;
    
    try {
      console.log(`=== EXTERNAL API REQUEST START ===`);
      console.log(`Method: ${method}`);
      console.log(`URL: ${this.config.baseUrl}${endpoint}`);
      console.log(`Data:`, data);

      // Get user session for potential API key retrieval
      const { data: { session } } = await supabase.auth.getSession();
      
      // Prepare headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'IoTAgentMesh-Client/1.0',
        ...this.config.defaultHeaders,
        ...headers
      };

      // Add API key if configured
      if (this.config.apiKey) {
        requestHeaders['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      console.log(`Request headers:`, requestHeaders);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
          method,
          headers: requestHeaders,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error ${response.status}:`, errorText);
          
          let errorMessage: string;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }

        const responseText = await response.text();
        console.log(`Response body:`, responseText);

        let responseData: R;
        try {
          responseData = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          throw new Error('Invalid JSON response from server');
        }

        console.log(`=== EXTERNAL API REQUEST SUCCESS ===`);
        return responseData;

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        
        throw fetchError;
      }

    } catch (error) {
      console.error(`=== EXTERNAL API REQUEST FAILED ===`);
      console.error(`Error details:`, error);
      
      if (error instanceof Error) {
        // Enhanced error handling with retry logic
        if (error.message.includes('timeout') || error.message.includes('network')) {
          throw new Error(`Network error: ${error.message}. Please check your connection and try again.`);
        }
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Authentication failed. Please check your API credentials.');
        }
        
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          throw new Error('Access denied. Please check your permissions.');
        }
        
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        
        throw error;
      }
      
      throw new Error(`Unknown error occurred: ${error}`);
    }
  }

  protected async retryRequest<R>(
    requestFn: () => Promise<R>, 
    maxAttempts: number = this.config.retryAttempts || 3
  ): Promise<R> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxAttempts}`);
        return await requestFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Attempt ${attempt} failed:`, lastError.message);
        
        // Don't retry on authentication or client errors
        if (lastError.message.includes('401') || 
            lastError.message.includes('403') || 
            lastError.message.includes('400')) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  protected handleError(error: unknown, operation: string): never {
    const message = error instanceof Error ? error.message : `Failed to ${operation}`;
    console.error(`${this.entityName} external service error in ${operation}:`, error);
    toast.error(message);
    throw new Error(message);
  }

  // Abstract methods for subclasses to implement
  abstract fetchAll(): Promise<T[]>;
  abstract fetchById(id: string): Promise<T | null>;
  abstract create(data: CreateDTO): Promise<T>;
  abstract update(id: string, data: UpdateDTO): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
}