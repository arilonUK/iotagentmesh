
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataBucketConfig, DataBucketFormData } from '@/types/dataBucket';
import { 
  fetchDataBuckets, 
  createDataBucket, 
  updateDataBucket, 
  deleteDataBucket 
} from '@/services/dataBucketService';
import { toast } from 'sonner';

/**
 * Hook for managing data buckets using React Query
 */
export const useDataBuckets = (organizationId?: string) => {
  const queryClient = useQueryClient();
  
  // Query for fetching data buckets
  const {
    data: buckets = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dataBuckets', organizationId],
    queryFn: () => fetchDataBuckets(organizationId || ''),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
  
  // Mutation for creating new buckets
  const createBucketMutation = useMutation({
    mutationFn: (bucketData: DataBucketFormData) => {
      console.log('Creating bucket with data:', bucketData);
      return createDataBucket(organizationId || '', bucketData);
    },
    onSuccess: (newBucket) => {
      console.log('Bucket created successfully:', newBucket);
      if (newBucket) {
        // Optimistically update the UI
        queryClient.setQueryData(
          ['dataBuckets', organizationId], 
          (oldData: DataBucketConfig[] | undefined) => 
            oldData ? [...oldData, newBucket] : [newBucket]
        );
        toast.success('Data bucket created successfully');
      }
    },
    onError: (error) => {
      console.error('Error creating bucket:', error);
      toast.error('Failed to create data bucket');
    }
  });
  
  // Mutation for updating buckets
  const updateBucketMutation = useMutation({
    mutationFn: ({ bucketId, bucketData }: { 
      bucketId: string; 
      bucketData: Partial<DataBucketFormData>; 
    }) => {
      console.log('Updating bucket:', bucketId, 'with data:', bucketData);
      return updateDataBucket(bucketId, bucketData);
    },
    onSuccess: (success, { bucketId, bucketData }) => {
      console.log('Bucket updated successfully:', success);
      if (success) {
        // Optimistically update the UI
        queryClient.setQueryData(
          ['dataBuckets', organizationId], 
          (oldData: DataBucketConfig[] | undefined) => {
            if (!oldData) return [];
            return oldData.map(bucket => 
              bucket.id === bucketId ? { ...bucket, ...bucketData } : bucket
            );
          }
        );
        toast.success('Data bucket updated successfully');
      }
    },
    onError: (error) => {
      console.error('Error updating bucket:', error);
      toast.error('Failed to update data bucket');
      // Refetch the data on error to ensure UI is in sync
      refetch();
    }
  });
  
  // Mutation for deleting buckets
  const deleteBucketMutation = useMutation({
    mutationFn: (bucketId: string) => {
      console.log('Deleting bucket:', bucketId);
      return deleteDataBucket(bucketId);
    },
    onSuccess: (success, bucketId) => {
      console.log('Bucket deleted successfully:', success);
      if (success) {
        // Optimistically update the UI
        queryClient.setQueryData(
          ['dataBuckets', organizationId], 
          (oldData: DataBucketConfig[] | undefined) => 
            oldData ? oldData.filter(bucket => bucket.id !== bucketId) : []
        );
        toast.success('Data bucket deleted successfully');
      }
    },
    onError: (error) => {
      console.error('Error deleting bucket:', error);
      toast.error('Failed to delete data bucket');
      // Refetch the data on error to ensure UI is in sync
      refetch();
    }
  });
  
  // Wrapper functions to simplify usage
  const createBucket = (bucketData: DataBucketFormData) => {
    console.log('createBucket called with:', bucketData);
    return createBucketMutation.mutate(bucketData);
  };
  
  const updateBucket = (bucketId: string, bucketData: Partial<DataBucketFormData>) => {
    console.log('updateBucket called with:', bucketId, bucketData);
    return updateBucketMutation.mutate({ bucketId, bucketData });
  };
  
  const deleteBucket = (bucketId: string) => {
    console.log('deleteBucket called with:', bucketId);
    return deleteBucketMutation.mutate(bucketId);
  };

  return { 
    buckets, 
    isLoading, 
    error, 
    createBucket, 
    updateBucket, 
    deleteBucket,
    refetch,
    isCreating: createBucketMutation.isPending,
    isUpdating: updateBucketMutation.isPending,
    isDeleting: deleteBucketMutation.isPending
  };
};
