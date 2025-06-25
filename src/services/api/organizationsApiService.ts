
import { apiGatewayService } from '@/services/apiGatewayService';
import { UserOrganization } from '@/contexts/auth/types';

// Check if organization ID is a fallback (not a real UUID)
function isFallbackOrganization(orgId: string): boolean {
  return orgId.startsWith('default-org-');
}

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
    // Handle fallback organizations
    if (isFallbackOrganization(organizationId)) {
      console.log('Returning fallback organization data');
      return {
        id: organizationId,
        name: 'My Organization',
        slug: 'my-organization',
        role: 'owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

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
    // Handle fallback organizations
    if (isFallbackOrganization(organizationId)) {
      console.log('Cannot fetch members for fallback organization via API');
      return [];
    }

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
