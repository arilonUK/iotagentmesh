
import { useStandardQuery, useStandardMutation } from '@/hooks/query/useStandardQuery';
import { profileService } from '@/services/storage';
import { FileStorageProfile } from '@/services/storage';
import { useQueryClient } from '@tanstack/react-query';

export const useStorageProfiles = (organizationId?: string) => {
  const queryClient = useQueryClient();

  // Get storage profiles query
  const {
    data: profiles = [],
    isLoading,
    error,
    refetch,
  } = useStandardQuery(
    ['storage-profiles', organizationId],
    () => profileService.getStorageProfiles(),
    {
      enabled: !!organizationId,
      showErrorToast: true,
      errorMessage: 'Failed to load storage profiles',
    }
  );

  // Create profile mutation
  const createProfile = useStandardMutation(
    (data: Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at'>) =>
      profileService.createStorageProfile(data),
    {
      showSuccessToast: true,
      successMessage: 'Storage profile created successfully',
      showErrorToast: true,
      errorMessage: 'Failed to create storage profile',
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['storage-profiles', organizationId],
        });
      },
    }
  );

  // Update profile mutation
  const updateProfile = useStandardMutation(
    ({ id, updates }: { id: string; updates: Partial<Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at'>> }) =>
      profileService.updateStorageProfile(id, updates),
    {
      showSuccessToast: true,
      successMessage: 'Storage profile updated successfully',
      showErrorToast: true,
      errorMessage: 'Failed to update storage profile',
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['storage-profiles', organizationId],
        });
      },
    }
  );

  // Delete profile mutation
  const deleteProfile = useStandardMutation(
    (id: string) => profileService.deleteStorageProfile(id),
    {
      showSuccessToast: true,
      successMessage: 'Storage profile deleted successfully',
      showErrorToast: true,
      errorMessage: 'Failed to delete storage profile',
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['storage-profiles', organizationId],
        });
      },
    }
  );

  return {
    profiles,
    isLoading,
    error,
    refetch,
    createProfile,
    updateProfile,
    deleteProfile,
  };
};
