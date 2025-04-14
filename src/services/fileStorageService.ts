import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type FileStorageProfile = {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  path: string;
  created_at: string;
  updated_at: string;
  public_read: boolean;
  index_file: string;
};

export type StorageFile = {
  id: string;
  name: string;
  size: number;
  mimetype: string;
  created_at: string;
  updated_at: string;
  lastModified?: number;
  path?: string;
};

export const fileStorageService = {
  // Storage Profile Management
  getStorageProfiles: async (organizationId: string): Promise<FileStorageProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('file_storage_profiles')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (error) {
        console.error('Error fetching storage profiles:', error);
        toast.error('Failed to load storage profiles');
        return [];
      }
      
      return data as FileStorageProfile[];
    } catch (error) {
      console.error('Exception fetching storage profiles:', error);
      toast.error('Failed to load storage profiles');
      return [];
    }
  },
  
  getStorageProfile: async (profileId: string): Promise<FileStorageProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('file_storage_profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (error) {
        console.error('Error fetching storage profile:', error);
        toast.error('Failed to load storage profile');
        return null;
      }
      
      return data as FileStorageProfile;
    } catch (error) {
      console.error('Exception fetching storage profile:', error);
      toast.error('Failed to load storage profile');
      return null;
    }
  },
  
  createStorageProfile: async (profile: Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<FileStorageProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('file_storage_profiles')
        .insert({
          ...profile,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating storage profile:', error);
        toast.error('Failed to create storage profile');
        return null;
      }
      
      toast.success('Storage profile created successfully');
      return data as FileStorageProfile;
    } catch (error) {
      console.error('Exception creating storage profile:', error);
      toast.error('Failed to create storage profile');
      return null;
    }
  },
  
  updateStorageProfile: async (id: string, updates: Partial<Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('file_storage_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating storage profile:', error);
        toast.error('Failed to update storage profile');
        return false;
      }
      
      toast.success('Storage profile updated successfully');
      return true;
    } catch (error) {
      console.error('Exception updating storage profile:', error);
      toast.error('Failed to update storage profile');
      return false;
    }
  },
  
  deleteStorageProfile: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('file_storage_profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting storage profile:', error);
        toast.error('Failed to delete storage profile');
        return false;
      }
      
      toast.success('Storage profile deleted successfully');
      return true;
    } catch (error) {
      console.error('Exception deleting storage profile:', error);
      toast.error('Failed to delete storage profile');
      return false;
    }
  },
  
  // File Management
  listFiles: async (organizationId: string, path: string = ''): Promise<StorageFile[]> => {
    try {
      const fullPath = `${organizationId}/${path}`.replace(/\/+$/, '');
      
      const { data, error } = await supabase
        .storage
        .from('device_files')
        .list(fullPath, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error('Error listing files:', error);
        toast.error('Failed to list files');
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        size: item.metadata?.size || 0,
        mimetype: item.metadata?.mimetype || '',
        created_at: item.created_at,
        updated_at: item.created_at,
        path: `${fullPath}/${item.name}`
      }));
    } catch (error) {
      console.error('Exception listing files:', error);
      toast.error('Failed to list files');
      return [];
    }
  },
  
  uploadFile: async (organizationId: string, path: string, file: File): Promise<boolean> => {
    try {
      const fullPath = `${organizationId}/${path}/${file.name}`.replace(/\/+/g, '/');
      
      const { error } = await supabase
        .storage
        .from('device_files')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload file');
        return false;
      }
      
      toast.success('File uploaded successfully');
      return true;
    } catch (error) {
      console.error('Exception uploading file:', error);
      toast.error('Failed to upload file');
      return false;
    }
  },
  
  downloadFile: async (organizationId: string, path: string, fileName: string): Promise<Blob | null> => {
    try {
      const fullPath = `${organizationId}/${path}/${fileName}`.replace(/\/+/g, '/');
      
      const { data, error } = await supabase
        .storage
        .from('device_files')
        .download(fullPath);
      
      if (error) {
        console.error('Error downloading file:', error);
        toast.error('Failed to download file');
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Exception downloading file:', error);
      toast.error('Failed to download file');
      return null;
    }
  },
  
  getFileUrl: async (organizationId: string, path: string, fileName: string): Promise<string | null> => {
    try {
      const fullPath = `${organizationId}/${path}/${fileName}`.replace(/\/+/g, '/');
      
      const { data, error } = await supabase
        .storage
        .from('device_files')
        .createSignedUrl(fullPath, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error getting file URL:', error);
        toast.error('Failed to get file URL');
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Exception getting file URL:', error);
      toast.error('Failed to get file URL');
      return null;
    }
  },
  
  deleteFile: async (organizationId: string, path: string, fileName: string): Promise<boolean> => {
    try {
      const fullPath = `${organizationId}/${path}/${fileName}`.replace(/\/+/g, '/');
      
      const { error } = await supabase
        .storage
        .from('device_files')
        .remove([fullPath]);
      
      if (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file');
        return false;
      }
      
      toast.success('File deleted successfully');
      return true;
    } catch (error) {
      console.error('Exception deleting file:', error);
      toast.error('Failed to delete file');
      return false;
    }
  },
  
  createDirectory: async (organizationId: string, path: string, dirName: string): Promise<boolean> => {
    try {
      // In Supabase Storage, directories are implicit
      // We create them by uploading a placeholder file
      const fullPath = `${organizationId}/${path}/${dirName}/.placeholder`.replace(/\/+/g, '/');
      
      const { error } = await supabase
        .storage
        .from('device_files')
        .upload(fullPath, new Blob([''], { type: 'text/plain' }), {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error creating directory:', error);
        toast.error('Failed to create directory');
        return false;
      }
      
      toast.success('Directory created successfully');
      return true;
    } catch (error) {
      console.error('Exception creating directory:', error);
      toast.error('Failed to create directory');
      return false;
    }
  }
};
