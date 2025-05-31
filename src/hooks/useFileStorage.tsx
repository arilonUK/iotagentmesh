
import { useFileStorageQueries } from '@/hooks/query/useFileStorageQueries';

export const useStorageFiles = (
  storageBucket: string | undefined,
  organizationId: string,
  currentPath: string
) => {
  const { useFiles, useUploadFile, useDeleteFile, useCreateDirectory } = useFileStorageQueries(
    organizationId,
    currentPath
  );

  const filesQuery = useFiles();
  const uploadMutation = useUploadFile();
  const deleteMutation = useDeleteFile();
  const createDirMutation = useCreateDirectory();

  return {
    files: filesQuery.data || [],
    isLoading: filesQuery.isLoading,
    error: filesQuery.error,
    uploadFile: uploadMutation,
    deleteFile: deleteMutation,
    createDirectory: createDirMutation,
    refetch: filesQuery.refetch,
  };
};

// Export the storage profiles hook
export { useStorageProfiles } from './useStorageProfiles';
