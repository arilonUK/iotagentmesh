
import { apiGatewayService } from '@/services/apiGatewayService';
import { Profile, UserOrganization } from '@/contexts/auth/types';

export const profilesApiService = {
  async getProfile(): Promise<Profile | null> {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: '/api/profiles/me'
    });

    if (response.error) {
      console.error('Error fetching profile:', response.error);
      return null;
    }

    return response.data?.profile || null;
  },

  async updateProfile(data: Partial<Profile>): Promise<Profile | null> {
    const response = await apiGatewayService.request({
      method: 'PUT',
      endpoint: '/api/profiles/me',
      data
    });

    if (response.error) {
      console.error('Error updating profile:', response.error);
      return null;
    }

    return response.data?.profile || null;
  },

  async getUserOrganizations(): Promise<UserOrganization[]> {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: '/api/profiles/organizations'
    });

    if (response.error) {
      console.error('Error fetching organizations:', response.error);
      return [];
    }

    return response.data?.organizations || [];
  },

  async switchOrganization(organizationId: string): Promise<boolean> {
    const response = await apiGatewayService.request({
      method: 'POST',
      endpoint: '/api/profiles/switch-organization',
      data: { organizationId }
    });

    if (response.error) {
      console.error('Error switching organization:', response.error);
      return false;
    }

    return response.data?.success || false;
  }
};
