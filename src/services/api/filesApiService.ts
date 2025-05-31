
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

  async updateStorageProfile(id: string, updates: Partial<Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<FileStorageProfile | null> {
    const response = await apiGatewayService.request({
      method: 'PUT',
      endpoint: `/api/files/profiles/${id}`,
      data: updates
    });

    if (response.error) {
      console.error('Error updating storage profile:', response.error);
      return null;
    }

    return response.data?.profile || null;
  },

  async deleteStorageProfile(id: string): Promise<boolean> {
    const response = await apiGatewayService.request({
      method: 'DELETE',
      endpoint: `/api/files/profiles/${id}`
    });

    if (response.error) {
      console.error('Error deleting storage profile:', response.error);
      return false;
    }

    return true;
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
  },

  async getFileUrl(organizationId: string, path: string, fileName: string): Promise<string | null> {
    const response = await apiGatewayService.request({
      method: 'GET',
      endpoint: `/api/files/url?path=${encodeURIComponent(path)}&fileName=${encodeURIComponent(fileName)}`
    });

    if (response.error) {
      console.error('Error getting file URL:', response.error);
      return null;
    }

    return response.data?.url || null;
  },

  async uploadFile(organizationId: string, path: string, file: File): Promise<boolean> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await apiGatewayService.request({
      method: 'POST',
      endpoint: '/api/files/upload',
      data: formData
    });

    if (response.error) {
      console.error('Error uploading file:', response.error);
      return false;
    }

    return true;
  },

  async deleteFile(organizationId: string, path: string, fileName: string): Promise<boolean> {
    const response = await apiGatewayService.request({
      method: 'DELETE',
      endpoint: `/api/files/delete?path=${encodeURIComponent(path)}&fileName=${encodeURIComponent(fileName)}`
    });

    if (response.error) {
      console.error('Error deleting file:', response.error);
      return false;
    }

    return true;
  },

  async createDirectory(organizationId: string, path: string, dirName: string): Promise<boolean> {
    const response = await apiGatewayService.request({
      method: 'POST',
      endpoint: '/api/files/directory',
      data: { path, dirName }
    });

    if (response.error) {
      console.error('Error creating directory:', response.error);
      return false;
    }

    return true;
  }
};
