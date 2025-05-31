
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
