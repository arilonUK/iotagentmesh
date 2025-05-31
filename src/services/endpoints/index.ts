
// Re-export the new standardized endpoints API service
export { endpointsApiService } from '@/services/api/endpointsApiService';

// Individual function exports for backward compatibility
export const fetchEndpoints = async () => {
  const { endpointsApiService } = await import('@/services/api/endpointsApiService');
  return endpointsApiService.fetchAll();
};

export const createEndpoint = async (data: any) => {
  const { endpointsApiService } = await import('@/services/api/endpointsApiService');
  return endpointsApiService.create(data);
};

export const updateEndpoint = async (id: string, data: any) => {
  const { endpointsApiService } = await import('@/services/api/endpointsApiService');
  return endpointsApiService.update(id, data);
};

export const deleteEndpoint = async (id: string) => {
  const { endpointsApiService } = await import('@/services/api/endpointsApiService');
  return endpointsApiService.delete(id);
};

export const triggerEndpoint = async (id: string, data?: any) => {
  const { endpointsApiService } = await import('@/services/api/endpointsApiService');
  return endpointsApiService.triggerEndpoint(id, data);
};
