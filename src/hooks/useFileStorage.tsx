
import { useState, useEffect } from 'react';
import { fileStorageService } from '@/services/storage/FileStorageService';
import { StorageFile, FileOperation } from '@/services/storage/interfaces/IFileStorageService';
import { toast } from 'sonner';

export const useStorageFiles = (
  storageBucket: string | undefined,
  organizationId: string,
  currentPath: string
) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operations, setOperations] = useState<FileOperation[]>([]);

  useEffect(() => {
    if (organizationId && currentPath !== undefined) {
      loadFiles();
    }
  }, [organizationId, currentPath]);

  useEffect(() => {
    // Subscribe to operation changes
    const unsubscribe = fileStorageService.onOperationsChange((newOperations) => {
      setOperations(newOperations as FileOperation[]);
    });

    return unsubscribe;
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fileList = await fileStorageService.listFiles(organizationId, currentPath);
      setFiles(fileList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = {
    mutate: async ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => {
      await fileStorageService.uploadFile(organizationId, currentPath, file, {
        onProgress,
        chunkSize: file.size > 5 * 1024 * 1024 ? 1024 * 1024 * 2 : undefined // 2MB chunks for files > 5MB
      });
      await loadFiles(); // Refresh the file list
    },
    isPending: operations.some(op => op.type === 'upload' && op.status === 'in-progress')
  };

  const deleteFile = {
    mutate: async ({ fileName }: { fileName: string }) => {
      await fileStorageService.deleteFile(organizationId, currentPath, fileName);
      await loadFiles(); // Refresh the file list
    },
    isPending: operations.some(op => op.type === 'delete' && op.status === 'in-progress')
  };

  const createDirectory = {
    mutate: async ({ dirName }: { dirName: string }) => {
      await fileStorageService.createDirectory(organizationId, currentPath, dirName);
      await loadFiles(); // Refresh the file list
    },
    isPending: false
  };

  const markForOffline = async (fileName: string) => {
    try {
      await fileStorageService.markForOfflineAccess(organizationId, currentPath, fileName);
      toast.success('File marked for offline access');
      await loadFiles();
    } catch (error) {
      toast.error('Failed to mark file for offline access');
    }
  };

  const removeOfflineAccess = async (fileName: string) => {
    try {
      await fileStorageService.removeOfflineAccess(organizationId, currentPath, fileName);
      toast.success('Offline access removed');
      await loadFiles();
    } catch (error) {
      toast.error('Failed to remove offline access');
    }
  };

  const syncOfflineChanges = async () => {
    try {
      const results = await fileStorageService.syncOfflineChanges();
      const successful = results.filter(op => op.status === 'completed').length;
      if (successful > 0) {
        toast.success(`Synced ${successful} offline changes`);
        await loadFiles();
      }
    } catch (error) {
      toast.error('Failed to sync offline changes');
    }
  };

  return {
    files,
    isLoading,
    error,
    operations,
    uploadFile,
    deleteFile,
    createDirectory,
    refetch: loadFiles,
    markForOffline,
    removeOfflineAccess,
    syncOfflineChanges,
    isOffline: fileStorageService.isOffline()
  };
};

// Export the storage profiles hook
export { useStorageProfiles } from './useStorageProfiles';
