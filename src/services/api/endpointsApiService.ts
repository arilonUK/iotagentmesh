
import { ApiService } from '../base/ApiService';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';

export class EndpointsApiService extends ApiService<EndpointConfig, EndpointFormData, Partial<EndpointFormData>> {
  protected readonly endpoint = '/api-endpoints';
  protected readonly entityName = 'Endpoint';
  protected readonly dataKey = 'endpoints';
  protected readonly singleDataKey = 'endpoint';

  // Backward compatibility methods
  async fetchEndpoints(): Promise<EndpointConfig[]> {
    return this.fetchAll();
  }

  async createEndpoint(data: EndpointFormData): Promise<EndpointConfig> {
    return this.create(data);
  }

  async updateEndpoint(id: string, data: Partial<EndpointFormData>): Promise<EndpointConfig> {
    return this.update(id, data);
  }

  async deleteEndpoint(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async triggerEndpoint(id: string, payload: any = {}): Promise<boolean> {
    try {
      await this.makeRequest<{ success: boolean; message: string }>({
        method: 'POST',
        endpoint: `${this.endpoint}/${id}/trigger`,
        data: payload
      });

      return true;
    } catch (error) {
      this.handleError(error, 'trigger endpoint');
    }
  }
}

export const endpointsApiService = new EndpointsApiService();
