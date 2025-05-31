
import { StandardizedApiService } from '../../base/StandardizedApiService';
import { EndpointConfig, EndpointFormData } from '@/types/endpoint';

export class ModernizedEndpointsApiService extends StandardizedApiService<EndpointConfig, EndpointFormData, Partial<EndpointFormData>> {
  protected readonly endpoint = '/api/endpoints';
  protected readonly serviceName = 'EndpointsApiService';

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
      const response = await this.makeRequest<{ success: boolean; message: string }>({
        method: 'POST',
        endpoint: `${this.endpoint}/${id}/trigger`,
        data: payload
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data?.success || false;
    } catch (error) {
      this.handleError(error, 'trigger endpoint');
      return false;
    }
  }
}
