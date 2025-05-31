
import { useStandardQuery, useStandardMutation } from './useStandardQuery';
import { fileService } from '@/services/storage';
import { StorageFile } from '@/services/storage';
import { useQueryClient } from '@tanstack/react-query';

export const useFileStorageQueries = (organizationId?: string, currentPath?: string) => {
  const queryClient = useQueryClient();

  // Get files query
  const useFiles = () => {
    return useStandardQuery(
      ['files', organizationId, currentPath],
      () => fileService.listFiles(organizationId!, currentPath!),
      {
        enabled: !!organizationId && currentPath !== undefined,
        showErrorToast: true,
        errorMessage: 'Failed to load files',
      }
    );
  };

  // Upload file mutation
  const useUploadFile = () => {
    return useStandardMutation(
      ({ file, path }: { file: File; path?: string }) =>
        fileService.uploadFile(organizationId!, path || currentPath || '', file),
      {
        showSuccessToast: true,
        successMessage: 'File uploaded successfully',
        showErrorToast: true,
        errorMessage: 'Failed to upload file',
        onSuccess: () => {
          // Invalidate files query to refresh the list
          queryClient.invalidateQueries({
            queryKey: ['files', organizationId, currentPath],
          });
        },
      }
    );
  };

  // Delete file mutation
  const useDeleteFile = () => {
    return useStandardMutation(
      ({ fileName }: { fileName: string }) =>
        fileService.deleteFile(organizationId!, currentPath || '', fileName),
      {
        showSuccessToast: true,
        successMessage: 'File deleted successfully',
        showErrorToast: true,
        errorMessage: 'Failed to delete file',
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['files', organizationId, currentPath],
          });
        },
      }
    );
  };

  // Create directory mutation
  const useCreateDirectory = () => {
    return useStandardMutation(
      ({ dirName }: { dirName: string }) =>
        fileService.createDirectory(organizationId!, currentPath || '', dirName),
      {
        showSuccessToast: true,
        successMessage: 'Directory created successfully',
        showErrorToast: true,
        errorMessage: 'Failed to create directory',
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['files', organizationId, currentPath],
          });
        },
      }
    );
  };

  return {
    useFiles,
    useUploadFile,
    useDeleteFile,
    useCreateDirectory,
  };
};
