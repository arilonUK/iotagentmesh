import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileStorageProfile, profileService, fileService } from '@/services/storage';
import { useAuth } from '@/contexts/auth';

export const useStorageProfiles = (organizationId?: string) => {
  const { organization } = useAuth();
  const orgId = organizationId || organization?.id;
  
  const {
    data: profiles = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['storage-profiles', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      return profileService.getStorageProfiles(orgId);
    },
    enabled: !!orgId,
  });
  
  const queryClient = useQueryClient();
  
  const createProfile = useMutation({
    mutationFn: (profile: Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at' | 'device_id'>) => 
      profileService.createStorageProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-profiles', orgId] });
    },
  });
  
  const updateProfile = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at'>> }) => 
      profileService.updateStorageProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-profiles', orgId] });
    },
  });
  
  const deleteProfile = useMutation({
    mutationFn: (id: string) => profileService.deleteStorageProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-profiles', orgId] });
    },
  });
  
  return {
    profiles,
    isLoading,
    error,
    refetch,
    createProfile,
    updateProfile,
    deleteProfile
  };
};

export const useStorageFiles = (profileId?: string, organizationId?: string, path: string = '') => {
  const { organization } = useAuth();
  const orgId = organizationId || organization?.id;
  
  const {
    data: files = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['storage-files', orgId, path, profileId],
    queryFn: async () => {
      if (!orgId) return [];
      return fileService.listFiles(orgId, path);
    },
    enabled: !!orgId,
  });
  
  const queryClient = useQueryClient();
  
  const uploadFile = useMutation({
    mutationFn: ({ file }: { file: File }) => 
      fileService.uploadFile(orgId!, path, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-files', orgId, path] });
    },
  });
  
  const deleteFile = useMutation({
    mutationFn: ({ fileName }: { fileName: string }) => 
      fileService.deleteFile(orgId!, path, fileName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-files', orgId, path] });
    },
  });
  
  const createDirectory = useMutation({
    mutationFn: ({ dirName }: { dirName: string }) => 
      fileService.createDirectory(orgId!, path, dirName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-files', orgId, path] });
    },
  });
  
  return {
    files,
    isLoading,
    error,
    refetch,
    uploadFile,
    deleteFile,
    createDirectory
  };
};

export const useFileStorage = {
  useStorageProfiles,
  useStorageFiles
};
