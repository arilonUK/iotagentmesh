
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
  paths: Record<string, Record<string, unknown>>;
  components: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
    responses?: Record<string, unknown>;
  };
  tags?: Array<{
    name: string;
    description: string;
  }>;
  security?: Array<Record<string, unknown>>;
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

      return (response.data as ApiDocumentation) || null;
    } catch (error) {
      console.error('Error fetching API documentation:', error);
      return null;
    }
  }
}
