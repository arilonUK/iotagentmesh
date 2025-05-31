
import { supabase } from '@/integrations/supabase/client';
import { BaseStorageAdapter } from './BaseStorageAdapter';
import { StorageFile, FileUploadOptions, FileDownloadOptions, FilePreviewOptions } from '../interfaces/IFileStorageService';
import { toast } from 'sonner';

export class SupabaseStorageAdapter extends BaseStorageAdapter {
  private readonly BUCKET_NAME = 'device_files';
  private readonly CHUNK_SIZE = 1024 * 1024 * 5; // 5MB chunks
  private chunkedUploads: Map<string, { file: File; organizationId: string; path: string; chunks: Blob[] }> = new Map();

  async uploadFile(organizationId: string, path: string, file: File, options?: FileUploadOptions): Promise<StorageFile> {
    const operation = this.createOperation('upload', {
      id: '',
      name: file.name,
      size: file.size,
      mimetype: file.type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      path: `${organizationId}/${path}/${file.name}`
    });

    try {
      // Check if we should use chunked upload for large files
      if (file.size > this.CHUNK_SIZE && options?.chunkSize) {
        return this.uploadFileInChunks(organizationId, path, file, options);
      }

      const fullPath = `${organizationId}/${path}/${file.name}`.replace(/\/+/g, '/');
      
      operation.status = 'in-progress';
      this.updateOperation(operation);

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: options?.overwrite ?? true
        });

      if (error) {
        throw error;
      }

      const storageFile: StorageFile = {
        id: data.path,
        name: file.name,
        size: file.size,
        mimetype: file.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        path: fullPath,
        metadata: options?.metadata
      };

      operation.status = 'completed';
      operation.progress = 100;
      operation.file = storageFile;
      this.updateOperation(operation);

      toast.success('File uploaded successfully');
      return storageFile;
    } catch (error) {
      operation.status = 'failed';
      operation.error = error instanceof Error ? error.message : 'Upload failed';
      this.updateOperation(operation);
      
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      throw error;
    }
  }

  private async uploadFileInChunks(organizationId: string, path: string, file: File, options: FileUploadOptions): Promise<StorageFile> {
    const uploadId = await this.initiateChunkedUpload(organizationId, path, file.name, file.size);
    const chunkSize = options.chunkSize || this.CHUNK_SIZE;
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    const uploadData = this.chunkedUploads.get(uploadId)!;
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      await this.uploadChunk(uploadId, i, chunk);
      
      const progress = Math.round(((i + 1) / totalChunks) * 100);
      options.onProgress?.(progress);
    }
    
    return this.completeChunkedUpload(uploadId);
  }

  async initiateChunkedUpload(organizationId: string, path: string, fileName: string, fileSize: number): Promise<string> {
    const uploadId = await super.initiateChunkedUpload(organizationId, path, fileName, fileSize);
    
    // Store upload metadata
    this.chunkedUploads.set(uploadId, {
      file: new File([], fileName),
      organizationId,
      path,
      chunks: []
    });
    
    return uploadId;
  }

  async uploadChunk(uploadId: string, chunkIndex: number, chunk: Blob): Promise<boolean> {
    const uploadData = this.chunkedUploads.get(uploadId);
    if (!uploadData) {
      throw new Error('Upload session not found');
    }
    
    uploadData.chunks[chunkIndex] = chunk;
    return true;
  }

  async completeChunkedUpload(uploadId: string): Promise<StorageFile> {
    const uploadData = this.chunkedUploads.get(uploadId);
    if (!uploadData) {
      throw new Error('Upload session not found');
    }
    
    // Combine all chunks
    const combinedFile = new File(uploadData.chunks, uploadData.file.name);
    
    // Clean up
    this.chunkedUploads.delete(uploadId);
    
    // Upload the combined file
    return this.uploadFile(uploadData.organizationId, uploadData.path, combinedFile);
  }

  async downloadFile(organizationId: string, path: string, fileName: string, options?: FileDownloadOptions): Promise<Blob> {
    try {
      const fullPath = `${organizationId}/${path}/${fileName}`.replace(/\/+/g, '/');
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(fullPath);
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
      throw error;
    }
  }

  async deleteFile(organizationId: string, path: string, fileName: string): Promise<boolean> {
    try {
      const fullPath = `${organizationId}/${path}/${fileName}`.replace(/\/+/g, '/');
      
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fullPath]);
      
      if (error) {
        throw error;
      }
      
      toast.success('File deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
      return false;
    }
  }

  async listFiles(organizationId: string, path: string = ''): Promise<StorageFile[]> {
    try {
      const fullPath = `${organizationId}/${path}`.replace(/\/+$/, '');
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(fullPath, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        throw error;
      }
      
      return data.map(item => ({
        id: item.id || '',
        name: item.name,
        size: item.metadata?.size || 0,
        mimetype: item.metadata?.mimetype || '',
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        path: `${fullPath}/${item.name}`
      }));
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  async getFileUrl(organizationId: string, path: string, fileName: string): Promise<string | null> {
    try {
      const fullPath = `${organizationId}/${path}/${fileName}`.replace(/\/+/g, '/');
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(fullPath, 3600); // 1 hour expiry
      
      if (error) {
        throw error;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }

  async getPreviewUrl(organizationId: string, path: string, fileName: string, options?: FilePreviewOptions): Promise<string | null> {
    try {
      const fullPath = `${organizationId}/${path}/${fileName}`.replace(/\/+/g, '/');
      
      // For images, we can use transform options
      const transformOptions: any = {};
      if (options?.width) transformOptions.width = options.width;
      if (options?.height) transformOptions.height = options.height;
      if (options?.quality) transformOptions.quality = options.quality;
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(fullPath, 3600, {
          transform: Object.keys(transformOptions).length > 0 ? transformOptions : undefined
        });
      
      if (error) {
        throw error;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting preview URL:', error);
      return this.getFileUrl(organizationId, path, fileName);
    }
  }

  async createDirectory(organizationId: string, path: string, dirName: string): Promise<boolean> {
    try {
      const fullPath = `${organizationId}/${path}/${dirName}/.placeholder`.replace(/\/+/g, '/');
      
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fullPath, new Blob([''], { type: 'text/plain' }), {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      toast.success('Directory created successfully');
      return true;
    } catch (error) {
      console.error('Error creating directory:', error);
      toast.error('Failed to create directory');
      return false;
    }
  }

  async deleteDirectory(organizationId: string, path: string, dirName: string): Promise<boolean> {
    try {
      const fullPath = `${organizationId}/${path}/${dirName}`.replace(/\/+/g, '/');
      
      // List all files in the directory first
      const files = await this.listFiles(organizationId, `${path}/${dirName}`);
      const filePaths = files.map(file => file.path);
      
      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filePaths);
        
        if (error) {
          throw error;
        }
      }
      
      toast.success('Directory deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting directory:', error);
      toast.error('Failed to delete directory');
      return false;
    }
  }
}
