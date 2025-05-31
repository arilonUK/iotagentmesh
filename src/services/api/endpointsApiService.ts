
import { BaseApiService } from '../base/BaseApiService';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';

export class EndpointsApiService extends BaseApiService<EndpointConfig, EndpointFormData, Partial<EndpointFormData>> {
  protected readonly endpoint = '/api/endpoints';

  protected getDataKey(): string {
    return 'endpoints';
  }

  protected getSingleDataKey(): string {
    return 'endpoint';
  }

  protected getEntityName(): string {
    return 'Endpoint';
  }

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
        endpoint: `/api/endpoints/${id}/trigger`,
        data: payload
      });

      return true;
    } catch (error) {
      this.handleError(error, 'trigger endpoint');
    }
  }
}

export const endpointsApiService = new EndpointsApiService();
