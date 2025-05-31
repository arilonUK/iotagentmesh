
import { supabase } from '@/integrations/supabase/client';

export interface ApiGatewayRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  headers?: Record<string, string>;
}

export interface ApiGatewayResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  processing_time?: number;
}

export interface ApiDocumentation {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  paths: Record<string, any>;
  components: Record<string, any>;
}

export const apiGatewayService = {
  /**
   * Make an API request through the gateway
   */
  async request<T = any>(request: ApiGatewayRequest): Promise<ApiGatewayResponse<T>> {
    try {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        method: request.method,
        body: {
          method: request.method,
          endpoint: request.endpoint,
          data: request.data,
          headers: request.headers
        }
      });

      if (error) {
        console.error('API Gateway request failed:', error);
        return {
          error: error.message || 'Request failed',
          status: 500
        };
      }

      return {
        data: data,
        status: 200
      };
    } catch (error) {
      console.error('API Gateway service error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  },

  /**
   * Get API documentation in OpenAPI format
   */
  async getDocumentation(): Promise<ApiDocumentation | null> {
    try {
      const { data, error } = await supabase.functions.invoke('api-gateway', {
        method: 'GET',
        body: {
          method: 'GET',
          endpoint: '/api/openapi.json'
        }
      });

      if (error) {
        console.error('Failed to fetch API documentation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching API documentation:', error);
      return null;
    }
  },

  /**
   * Get API documentation URL
   */
  getDocumentationUrl(): string {
    return 'https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway/api/docs';
  },

  /**
   * Generate Postman collection from OpenAPI spec
   */
  async generatePostmanCollection(): Promise<any> {
    try {
      const documentation = await this.getDocumentation();
      if (!documentation) {
        throw new Error('Failed to fetch API documentation');
      }

      const collection = {
        info: {
          name: documentation.info.title,
          description: documentation.info.description,
          version: documentation.info.version,
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        auth: {
          type: "bearer",
          bearer: [
            {
              key: "token",
              value: "{{api_key}}",
              type: "string"
            }
          ]
        },
        variable: [
          {
            key: "base_url",
            value: "https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway"
          },
          {
            key: "api_key",
            value: "iot_your_api_key_here"
          }
        ],
        item: this.convertPathsToPostmanItems(documentation.paths)
      };

      return collection;
    } catch (error) {
      console.error('Error generating Postman collection:', error);
      throw error;
    }
  },

  /**
   * Convert OpenAPI paths to Postman collection items
   */
  convertPathsToPostmanItems(paths: Record<string, any>): any[] {
    const items: any[] = [];

    Object.entries(paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
        if (method === 'parameters') return; // Skip path-level parameters

        const item: any = {
          name: operation.summary || `${method.toUpperCase()} ${path}`,
          request: {
            method: method.toUpperCase(),
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            url: {
              raw: `{{base_url}}${path}`,
              host: ["{{base_url}}"],
              path: path.split('/').filter(Boolean)
            }
          }
        };

        // Add request body if present
        if (operation.requestBody?.content?.['application/json']?.schema) {
          item.request.body = {
            mode: "raw",
            raw: JSON.stringify(this.generateExampleFromSchema(
              operation.requestBody.content['application/json'].schema
            ), null, 2)
          };
        }

        // Add query parameters
        if (operation.parameters) {
          const queryParams = operation.parameters
            .filter((param: any) => param.in === 'query')
            .map((param: any) => ({
              key: param.name,
              value: param.example || '',
              description: param.description
            }));
          
          if (queryParams.length > 0) {
            item.request.url.query = queryParams;
          }
        }

        items.push(item);
      });
    });

    return items;
  },

  /**
   * Generate example data from JSON schema
   */
  generateExampleFromSchema(schema: any): any {
    if (schema.type === 'object') {
      const example: any = {};
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
          example[key] = this.generateExampleFromSchema(prop);
        });
      }
      return example;
    } else if (schema.type === 'array') {
      return [this.generateExampleFromSchema(schema.items || { type: 'string' })];
    } else if (schema.type === 'string') {
      if (schema.format === 'uuid') return '12345678-1234-1234-1234-123456789012';
      if (schema.format === 'date-time') return new Date().toISOString();
      if (schema.format === 'uri') return 'https://example.com/webhook';
      return schema.example || 'string';
    } else if (schema.type === 'number' || schema.type === 'integer') {
      return schema.example || 0;
    } else if (schema.type === 'boolean') {
      return schema.example || true;
    }
    return null;
  },

  /**
   * Download Postman collection as JSON file
   */
  async downloadPostmanCollection(): Promise<void> {
    try {
      const collection = await this.generatePostmanCollection();
      const blob = new Blob([JSON.stringify(collection, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.info.name.replace(/\s+/g, '_')}_postman_collection.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Postman collection:', error);
      throw error;
    }
  }
};
