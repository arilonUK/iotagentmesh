
import { ApiGatewayClient } from './ApiGatewayClient';

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
