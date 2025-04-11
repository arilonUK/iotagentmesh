
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
    mutationFn: (bucketData: DataBucketFormData) => 
      createDataBucket(organizationId || '', bucketData),
    onSuccess: (newBucket) => {
      if (newBucket) {
        // Optimistically update the UI
        queryClient.setQueryData(
          ['dataBuckets', organizationId], 
          (oldData: DataBucketConfig[] | undefined) => 
            oldData ? [...oldData, newBucket] : [newBucket]
        );
        toast.success('Data bucket created successfully');
      }
    }
  });
  
  // Mutation for updating buckets
  const updateBucketMutation = useMutation({
    mutationFn: ({ bucketId, bucketData }: { 
      bucketId: string; 
      bucketData: Partial<DataBucketFormData>; 
    }) => updateDataBucket(bucketId, bucketData),
    onSuccess: (success, { bucketId, bucketData }) => {
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
      }
    },
    onError: () => {
      // Refetch the data on error to ensure UI is in sync
      refetch();
    }
  });
  
  // Mutation for deleting buckets
  const deleteBucketMutation = useMutation({
    mutationFn: (bucketId: string) => deleteDataBucket(bucketId),
    onSuccess: (success, bucketId) => {
      if (success) {
        // Optimistically update the UI
        queryClient.setQueryData(
          ['dataBuckets', organizationId], 
          (oldData: DataBucketConfig[] | undefined) => 
            oldData ? oldData.filter(bucket => bucket.id !== bucketId) : []
        );
      }
    },
    onError: () => {
      // Refetch the data on error to ensure UI is in sync
      refetch();
    }
  });
  
  // Wrapper functions to simplify usage
  const createBucket = (bucketData: DataBucketFormData) => {
    return createBucketMutation.mutate(bucketData);
  };
  
  const updateBucket = (bucketId: string, bucketData: Partial<DataBucketFormData>) => {
    return updateBucketMutation.mutate({ bucketId, bucketData });
  };
  
  const deleteBucket = (bucketId: string) => {
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
