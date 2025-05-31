
import { apiGatewayService } from '@/services/apiGatewayService';
import { UserOrganization } from '@/contexts/auth/types';

export const organizationsApiService = {
  async getUserOrganizations(): Promise<UserOrganization[]> {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: '/api/organizations'
    });

    if (response.error) {
      console.error('Error fetching organizations:', response.error);
      return [];
    }

    return response.data?.organizations || [];
  },

  async getOrganization(organizationId: string) {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: `/api/organizations/${organizationId}`
    });

    if (response.error) {
      console.error('Error fetching organization:', response.error);
      return null;
    }

    return response.data?.organization || null;
  },

  async getOrganizationMembers(organizationId: string) {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: `/api/organizations/${organizationId}/members`
    });

    if (response.error) {
      console.error('Error fetching organization members:', response.error);
      return [];
    }

    return response.data?.members || [];
  }
};
