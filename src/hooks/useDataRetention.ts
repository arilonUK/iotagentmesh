
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDataRetention() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateRetentionDays = async (bucketId: string, retentionDays: number): Promise<void> => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('data_buckets')
        .update({ 
          retention_days: retentionDays,
          updated_at: new Date().toISOString()
        })
        .eq('id', bucketId);
      
      if (error) {
        throw new Error(`Error updating data retention: ${error.message}`);
      }
      
      // Log the action to audit logs
      await supabase.rpc('create_audit_log_entry', {
        p_organization_id: null, // Will be populated in the RPC function
        p_user_id: null, // Will be populated in the RPC function
        p_action: 'update_data_retention',
        p_details: {
          bucket_id: bucketId,
          retention_days: retentionDays
        }
      });
      
      return;
    } catch (error) {
      console.error('Failed to update retention days:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const mutation = useMutation({
    mutationFn: ({ bucketId, retentionDays }: { bucketId: string, retentionDays: number }) => 
      updateRetentionDays(bucketId, retentionDays),
    onSuccess: () => {
      // Invalidate queries that depend on data buckets
      queryClient.invalidateQueries({ queryKey: ['dataBuckets'] });
      toast.success('Data retention period updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update data retention: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    updateRetentionDays: (bucketId: string, retentionDays: number) => 
      mutation.mutate({ bucketId, retentionDays }),
    isUpdating: isUpdating || mutation.isPending
  };
}
