
import { apiGatewayService } from '@/services/apiGatewayService';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';

export const endpointsApiService = {
  async fetchEndpoints(): Promise<EndpointConfig[]> {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: '/api/endpoints'
    });

    if (response.error) {
      console.error('Error fetching endpoints:', response.error);
      return [];
    }

    return response.data?.endpoints || [];
  },

  async createEndpoint(data: EndpointFormData): Promise<EndpointConfig | null> {
    const response = await apiGatewayService.request({
      method: 'POST',
      endpoint: '/api/endpoints',
      data
    });

    if (response.error) {
      console.error('Error creating endpoint:', response.error);
      return null;
    }

    return response.data?.endpoint || null;
  },

  async updateEndpoint(id: string, data: Partial<EndpointFormData>): Promise<boolean> {
    const response = await apiGatewayService.request({
      method: 'PUT',
      endpoint: `/api/endpoints/${id}`,
      data
    });

    if (response.error) {
      console.error('Error updating endpoint:', response.error);
      return false;
    }

    return true;
  },

  async deleteEndpoint(id: string): Promise<boolean> {
    const response = await apiGatewayService.request({
      method: 'DELETE',
      endpoint: `/api/endpoints/${id}`
    });

    if (response.error) {
      console.error('Error deleting endpoint:', response.error);
      return false;
    }

    return true;
  },

  async triggerEndpoint(id: string, payload: any = {}): Promise<boolean> {
    const response = await apiGatewayService.request({
      method: 'POST',
      endpoint: `/api/endpoints/${id}/trigger`,
      data: payload
    });

    if (response.error) {
      console.error('Error triggering endpoint:', response.error);
      return false;
    }

    return true;
  }
};
