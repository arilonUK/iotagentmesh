
import { ApiGatewayClient } from './ApiGatewayClient';

export interface ApiDocumentation {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact?: {
      name?: string;
      email?: string;
    };
  };
  servers?: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
    responses?: Record<string, any>;
  };
  tags?: Array<{
    name: string;
    description: string;
  }>;
  security?: Array<Record<string, any>>;
}

export class OpenApiDocumentationService {
  constructor(private client: ApiGatewayClient) {}

  /**
   * Get API documentation in OpenAPI format
   */
  async getDocumentation(): Promise<ApiDocumentation | null> {
    try {
      const response = await this.client.request({
        method: 'GET',
        endpoint: '/api/openapi.json'
      });

      if (response.error) {
        console.error('Failed to fetch API documentation:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error fetching API documentation:', error);
      return null;
    }
  }
}
