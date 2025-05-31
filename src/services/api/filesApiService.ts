
import { apiGatewayService } from '@/services/apiGatewayService';
import { FileStorageProfile } from '@/services/storage/types';

export interface StorageFile {
  id: string;
  name: string;
  size: number;
  mimetype: string;
  created_at: string;
  updated_at: string;
  path: string;
}

export const filesApiService = {
  async getStorageProfiles(): Promise<FileStorageProfile[]> {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: '/api/files/profiles'
    });

    if (response.error) {
      console.error('Error fetching storage profiles:', response.error);
      return [];
    }

    return response.data?.profiles || [];
  },

  async createStorageProfile(data: Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at'>): Promise<FileStorageProfile | null> {
    const response = await apiGatewayService.request({
      method: 'POST',
      endpoint: '/api/files/profiles',
      data
    });

    if (response.error) {
      console.error('Error creating storage profile:', response.error);
      return null;
    }

    return response.data?.profile || null;
  },

  async getStorageProfile(profileId: string): Promise<FileStorageProfile | null> {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: `/api/files/profiles/${profileId}`
    });

    if (response.error) {
      console.error('Error fetching storage profile:', response.error);
      return null;
    }

    return response.data?.profile || null;
  },

  async listFiles(path: string = ''): Promise<StorageFile[]> {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: `/api/files/list?path=${encodeURIComponent(path)}`
    });

    if (response.error) {
      console.error('Error listing files:', response.error);
      return [];
    }

    return response.data?.files || [];
  }
};
